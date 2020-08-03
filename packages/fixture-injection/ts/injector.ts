import createDebug from 'debug'
import ipc from 'node-ipc'

import {
  IPC_CLIENT_ID,
  IPC_DEFAULT_OPTIONS,
  IPC_SERVER_ID,
  constructDependencyMap,
  fixtureArguments,
  fixtureObjects,
  fixturePromise,
  isObject
} from './common'
import { Label, LocalLogger, LogEvent, Logger, Operation, RemoteLogger, Scope } from './logger'
import {
  DependencyMap,
  Fixture,
  FixtureContainer,
  FixtureObject,
  IpcResolver,
  Lifecycle,
  Provide
} from './types'

const debug = createDebug('fixture-injection:injector')

export class FixtureInjector {
  public fixturesPath: string | undefined
  public globalFixturesPath: string | undefined
  private connectionPromise: Promise<void> | undefined
  private fixtures: Record<string, Fixture>
  private dependencyMap: DependencyMap
  private inlineFixtures: Record<string, Fixture>
  private globalFixtures: Record<string, Fixture>
  private globalFinishPromises: Promise<void>[]
  private globalFixtureObjects: Record<string, FixtureObject>
  private globalFinish: Promise<void>
  private ipcResolvers: Record<string, IpcResolver[]>
  private globalFinished: (() => void) | undefined
  public logger: Logger

  constructor(
    public rootDir: string,
    public useGlobalFixtureServer: boolean,
    public ipcOptions: Partial<typeof ipc.config> = {}
  ) {
    this.ipcOptions = { ...IPC_DEFAULT_OPTIONS, ...ipcOptions }
    this.fixturesPath = undefined
    this.globalFixturesPath = undefined
    this.connectionPromise = undefined
    this.fixtures = {}
    this.dependencyMap = {}
    this.inlineFixtures = {}
    this.globalFixtures = {}
    this.globalFinishPromises = []
    this.globalFixtureObjects = {}
    this.globalFinished = undefined
    this.globalFinish = new Promise(resolve => {
      this.globalFinished = resolve
    })
    this.ipcResolvers = {}
    this.logger = this.useGlobalFixtureServer ? new RemoteLogger() : new LocalLogger()
  }

  public load(globalFixtures?: Record<string, Fixture>, fixtures?: Record<string, Fixture>): void {
    this.globalFixtures = globalFixtures || {}
    this.fixtures = fixtures || {}
    debug(
      'loaded fixtures - global: %o local: %o',
      Object.keys(this.globalFixtures),
      Object.keys(this.fixtures)
    )
  }

  private nonGlobalFixtures(): Record<string, Fixture> {
    return { ...this.fixtures, ...this.inlineFixtures }
  }

  private allFixtureDependencyMap(): Record<string, Fixture> {
    return { ...this.dependencyMap, ...constructDependencyMap(this.inlineFixtures) }
  }

  public defineFixture(
    name: string,
    fixture: Fixture,
    beforeAll: Lifecycle,
    afterAll: Lifecycle
  ): void {
    beforeAll(async () => {
      this.inlineFixtures[name] = fixture
    })
    afterAll(async () => {
      delete this.inlineFixtures[name]
    })
  }

  public beforeAll(
    fn: () => Promise<void> | void,
    beforeAll: Lifecycle,
    afterAll: Lifecycle,
    ancestors: string[]
  ): void {
    const fixtureNames = fixtureArguments(fn)
    let finish: () => Promise<void> | void = () => Promise.resolve()
    beforeAll(async () => {
      finish = await this.callWithFixtures(
        fn,
        () => {
          this.beforeAllLog(ancestors, fixtureNames, LogEvent.Start)
        },
        () => {
          this.beforeAllLog(ancestors, fixtureNames, LogEvent.End)
        }
      )
    })
    afterAll(async () => {
      this.afterAllLog(ancestors, fixtureNames, LogEvent.Start)
      await finish()
      this.afterAllLog(ancestors, fixtureNames, LogEvent.End)
    })
  }

  injectableFn(
    origFn: (desc: string, fn: () => Promise<void> | void) => void,
    ancestors: string[]
  ): (desc: string, fn: (...args: any[]) => Promise<void> | void) => void {
    return (desc: string, fn: (...args: any[]) => Promise<void> | void) =>
      origFn(desc, async () => {
        const fixtureNames = fixtureArguments(fn)
        const finish = await this.callWithFixtures(
          fn,
          () => {
            this.testLog(desc, ancestors, fixtureNames, LogEvent.Start)
          },
          () => {
            this.testLog(desc, ancestors, fixtureNames, LogEvent.End)
          }
        )
        await finish()
      })
  }

  public setup(): Promise<void> {
    if (this.useGlobalFixtureServer) {
      debug('setup global')
      this.connectionPromise = new Promise(connectionResolve => {
        Object.assign(ipc.config, this.ipcOptions, { id: IPC_CLIENT_ID })
        debug('ipc.config: %o', ipc.config)

        ipc.connectTo(IPC_SERVER_ID, () => {
          ipc.of[IPC_SERVER_ID].on('connect', () => {
            debug('server connected')
            ipc.of[IPC_SERVER_ID].emit('dependencies')
          })

          ipc.of[IPC_SERVER_ID].on('dependencies', (dependencyMap: DependencyMap) => {
            debug('receive dependencies')
            this.dependencyMap = {
              ...dependencyMap,
              ...constructDependencyMap(this.fixtures)
            }
            connectionResolve()
          })

          ipc.of[IPC_SERVER_ID].on(
            'fixture',
            (payload: { name: string; fixture: any; error: string }) => {
              debug('receive fixture %s', payload)
              const { name, fixture, error } = payload
              this.ipcResolvers[name].forEach((fixtureResolve: IpcResolver) => {
                if (error) {
                  fixtureResolve(new Error(error))
                } else {
                  fixtureResolve(fixture)
                }
              })
              this.ipcResolvers[name] = []
            }
          )
        })
      })
      return this.connectionPromise
    } else {
      // !this.useGlobalFixtureServer
      debug('setup local')
      this.dependencyMap = constructDependencyMap({ ...this.globalFixtures, ...this.fixtures })
      return Promise.resolve()
    }
  }

  public async teardown(): Promise<void> {
    debug('teardown')
    let serverPromise: Promise<void> = Promise.resolve()
    if (this.useGlobalFixtureServer) {
      serverPromise = new Promise((resolve, reject) => {
        debug('disconnecting')
        this.connectionPromise!.then(() => {
          ipc.of[IPC_SERVER_ID].on('disconnect', () => {
            debug('disconnected')
            resolve()
          })
          ipc.disconnect(IPC_SERVER_ID)
        }).catch(err => reject(err))
      })
    }
    debug('finishing global')
    this.globalFinished!()
    await Promise.all([serverPromise, ...this.globalFinishPromises])
  }

  private async callWithFixtures(
    fn: (...args: any[]) => Promise<void> | void,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<() => Promise<void> | void> {
    let fnFinished: () => void
    const fnFinish: Promise<void> = new Promise(resolve => {
      fnFinished = resolve
    })
    const finishPromises: Promise<void>[] = []

    const fixtureNames = fixtureArguments(fn)

    const constructFixturePromise = (
      fixtureName: string,
      dependenciesPromise: Promise<FixtureContainer[]>
    ) => {
      return new Promise((resolve, reject) => {
        if (
          !(fixtureName in this.nonGlobalFixtures()) &&
          fixtureName in this.globalFixtureObjects
        ) {
          resolve(this.globalFixtureObjects[fixtureName])
          return
        }
        dependenciesPromise
          .then((dependencies: FixtureContainer[]) => {
            const provide: Provide = (fixtureObject: FixtureObject): Promise<void> => {
              resolve(fixtureObject)
              return fnFinish
            }
            const globalProvide = (fixtureObject: FixtureObject): Promise<void> => {
              this.globalFixtureObjects[fixtureName] = fixtureObject
              resolve(fixtureObject)
              return this.globalFinish
            }
            const { initializedFixture, isGlobal } = this.initFixture(
              fixtureName,
              provide,
              globalProvide,
              dependencies
            )
            if (isGlobal) {
              this.globalFinishPromises.push(initializedFixture)
            } else {
              finishPromises.push(initializedFixture)
            }
          })
          .catch(err => reject(err))
      })
    }

    const objects = await fixtureObjects(
      fixtureNames,
      this.allFixtureDependencyMap(),
      constructFixturePromise
    )

    if (onStart) onStart()
    debug('calling test %s %o', fn, objects)
    await fn(...objects)
    debug('called test %s %o', fn, objects)
    if (onEnd) onEnd()

    return async () => {
      debug('finishing %s', fn)
      fnFinished()
      debug('finished %s', fn)
      debug('waiting promises: %o', finishPromises)
      await Promise.all(finishPromises)
      debug('finished waiting promises')
    }
  }

  private initFixture(
    name: string,
    provide: Provide,
    globalProvide: Provide,
    dependencies: FixtureContainer[]
  ): { initializedFixture: Promise<FixtureObject>; isGlobal: boolean } {
    const localFixture = this.nonGlobalFixtures()[name]
    if (localFixture) {
      debug('initializing local fixture: %s %o', name, localFixture)
      return {
        initializedFixture: fixturePromise(
          localFixture,
          provide,
          fixtureArguments(localFixture).map((name: string) => {
            const container = dependencies.find(d => d.name === name)
            return container ? container.fixture : undefined
          }),
          false,
          () => {
            this.fixtureLog(Operation.Setup, LogEvent.Start, Scope.Local, name)
          },
          () => {
            this.fixtureLog(Operation.Setup, LogEvent.End, Scope.Local, name)
          },
          () => {
            this.fixtureLog(Operation.Teardown, LogEvent.Start, Scope.Local, name)
          },
          () => {
            this.fixtureLog(Operation.Teardown, LogEvent.End, Scope.Local, name)
          }
        ),
        isGlobal: false
      }
    } else if (this.useGlobalFixtureServer) {
      debug('initializing global server fixture: %s', name)
      const promise = new Promise(resolve => {
        if (!(name in this.ipcResolvers)) {
          this.ipcResolvers[name] = []
        }
        this.ipcResolvers[name].push((result: FixtureObject | Error) => {
          if (result instanceof Error) {
            throw result
          }
          // Global fixtures should be frozen
          const fixtureObject = isObject(result) ? Object.freeze(result) : result
          globalProvide(fixtureObject) // tslint:disable-line no-floating-promises
          resolve(fixtureObject)
        })
      })
      debug('emitting fixture request: %s', name)
      ipc.of[IPC_SERVER_ID].emit('fixture', { name })
      debug('emitted fixture request: %s', name)
      return { initializedFixture: promise, isGlobal: true }
    } else if (this.globalFixtures) {
      // Local global fixtures for Jasmine
      const globalFixture = this.globalFixtures[name]
      debug('initializing global fixture: %s %o', name, globalFixture)
      if (globalFixture === undefined) {
        throw Error(`Undefined fixture '${name}'`)
      }
      return {
        initializedFixture: fixturePromise(
          globalFixture,
          // Global fixtures should be frozen in Jasmine
          (fixtureObject: FixtureObject) => globalProvide(Object.freeze(fixtureObject)),
          fixtureArguments(globalFixture).map((name: string) => {
            const container = dependencies.find(d => d.name === name)
            return container ? container.fixture : undefined
          }),
          true,
          () => {
            this.fixtureLog(Operation.Setup, LogEvent.Start, Scope.Global, name)
          },
          () => {
            this.fixtureLog(Operation.Setup, LogEvent.End, Scope.Global, name)
          },
          () => {
            this.fixtureLog(Operation.Teardown, LogEvent.Start, Scope.Global, name)
          },
          () => {
            this.fixtureLog(Operation.Teardown, LogEvent.End, Scope.Global, name)
          }
        ),
        isGlobal: true
      }
    } else {
      throw Error(`Undefined fixture '${name}'`)
    }
  }

  private fixtureLog(operation: Operation, event: LogEvent, scope: Scope, name: string): void {
    this.logger.fixtureLog(operation, event, scope, name)
  }

  private functionLog(
    label: Label,
    desc: string,
    ancestors: string[],
    fixtureNames: string[],
    event: LogEvent
  ): void {
    this.logger.functionLog(label, desc, ancestors, fixtureNames, event)
  }

  private testLog(
    desc: string,
    ancestors: string[],
    fixtureNames: string[],
    event: LogEvent
  ): void {
    this.functionLog(Label.Test, desc, ancestors, fixtureNames, event)
  }

  private beforeAllLog(ancestors: string[], fixtureNames: string[], event: LogEvent): void {
    this.functionLog(Label.BeforeAll, 'beforeAll', ancestors, fixtureNames, event)
  }

  private afterAllLog(ancestors: string[], fixtureNames: string[], event: LogEvent): void {
    this.functionLog(Label.AfterAll, 'afterAll', ancestors, fixtureNames, event)
  }
}
