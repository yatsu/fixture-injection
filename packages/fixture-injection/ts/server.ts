import createDebug from 'debug'
import ipc from 'node-ipc'

import {
  IPC_CLIENT_ID,
  IPC_DEFAULT_OPTIONS,
  IPC_SERVER_ID,
  constructDependencyMap,
  fixtureArguments,
  fixturePromise
} from './common'
import { LocalLogger, LogEvent, LogPayload, Operation, Scope } from './logger'
import { DependencyMap, Fixture, FixtureObject } from './types'

const debug = createDebug('fixture-injection:server')

export class FixtureServer {
  private fixtures: Record<string, Fixture>
  private dependencyMap: DependencyMap
  private logger: LocalLogger

  constructor(
    fixtures: Record<string, Fixture>,
    public ipcOptions: Partial<typeof ipc.config> = {}
  ) {
    this.ipcOptions = { ...IPC_DEFAULT_OPTIONS, ...ipcOptions }
    this.fixtures = fixtures
    this.dependencyMap = constructDependencyMap(this.fixtures)
    debug('dependencyMap: %o', this.dependencyMap)
    this.logger = new LocalLogger()
  }

  async start(): Promise<void> {
    debug('starting')
    this.logger.start()

    const cachedObjects: Record<string, FixtureObject> = {}

    let runnerFinished: () => void
    const runnerFinish: Promise<void> = new Promise(resolve => {
      runnerFinished = resolve
    })

    const fixturePromises: Record<string, Promise<FixtureObject>> = {}
    const finishPromises: Promise<void>[] = []

    const startupPromise = new Promise((startupResolve, startupReject) => {
      Object.assign(ipc.config, this.ipcOptions, { id: IPC_SERVER_ID })

      ipc.serve(() => {
        ipc.server.on('dependencies', (_, socket) => {
          debug('emitting dependencies')
          ipc.server.emit(socket, 'dependencies', this.dependencyMap)
          debug('emitted dependencies - dependencyMap: %s', this.dependencyMap)
        })

        ipc.server.on('fixture', ({ name }, socket) => {
          debug('receiving fixture request %s', name)
          if (name in cachedObjects) {
            debug('return cached fixture: %s', name)
            ipc.server.emit(socket, 'fixture', {
              name,
              fixture: cachedObjects[name]
            })
            return
          }

          if (name in fixturePromises) {
            debug('waiting fixture promise: %s', name)
            fixturePromises[name]
              .then((fixtureObject: FixtureObject) => {
                debug('emitting fixture: %s %s', name, fixtureObject)
                ipc.server.emit(socket, 'fixture', {
                  name,
                  fixture: fixtureObject
                })
                debug('emitted fixture: %s', name)
              })
              .catch(err => startupReject(err))
            return
          }

          Promise.all(this.dependencyMap[name].map(n => fixturePromises[n]))
            .then(() => {
              fixturePromises[name] = new Promise(fixtureResolve => {
                const fixtureDef = this.fixtures[name]
                const provide = (fixtureObject: FixtureObject) => {
                  cachedObjects[name] = fixtureObject
                  fixtureResolve(fixtureObject)
                  return runnerFinish
                }
                const initializedFixture = fixturePromise(
                  fixtureDef,
                  provide,
                  fixtureArguments(fixtureDef).map(n => cachedObjects[n]),
                  false,
                  () => {
                    this.logger.fixtureLog(Operation.Setup, LogEvent.Start, Scope.Global, name)
                  },
                  () => {
                    this.logger.fixtureLog(Operation.Setup, LogEvent.End, Scope.Global, name)
                  },
                  () => {
                    this.logger.fixtureLog(Operation.Teardown, LogEvent.Start, Scope.Global, name)
                  },
                  () => {
                    this.logger.fixtureLog(Operation.Teardown, LogEvent.End, Scope.Global, name)
                  }
                )
                finishPromises.push(initializedFixture)
                // fixture object will be resolved later
              })

              fixturePromises[name]
                .then(fixture => {
                  ipc.server.emit(socket, 'fixture', {
                    name,
                    fixture
                  })
                })
                .catch(err => startupReject(err))
            })
            .catch(err => startupReject(err))
        })

        ipc.server.on('log', ({ type, payload }) => {
          if (type === 'fixture') {
            const { operation, event, scope, name } = payload
            this.logger.fixtureLog(operation, event, scope, name)
          } else {
            const { label, desc, ancestors, fixtures, event } = payload
            this.logger.functionLog(label, desc, ancestors, fixtures, event)
          }
        })

        ipc.server.on('teardown', (_, socket) => {
          debug('teardown received')
          runnerFinished()
          Promise.all(finishPromises)
            .then(() => {
              debug('stopping')
              ipc.server.emit(socket, 'logs', this.logger.logs)
              ipc.server.stop()
            })
            .catch(err => startupReject(err))
        })

        startupResolve()
      })

      debug('starting ipc')
      ipc.server.start()
    })

    await startupPromise
  }

  static async teardown(): Promise<[number, LogPayload][]> {
    debug('requesting teardown')
    let logRecords: [number, LogPayload][] | undefined = undefined
    await new Promise(resolve => {
      ipc.config.id = IPC_CLIENT_ID
      ipc.config.silent = true
      debug('teardown connecting')
      ipc.connectTo(IPC_SERVER_ID, () => {
        ipc.of[IPC_SERVER_ID].on('connect', () => {
          debug('teardown connected')
          ipc.of[IPC_SERVER_ID].emit('teardown')
          ipc.of[IPC_SERVER_ID].on('logs', (logs: [number, LogPayload][]) => {
            logRecords = logs
            ipc.disconnect(IPC_SERVER_ID)
          })
        })
        ipc.of[IPC_SERVER_ID].on('disconnect', () => {
          debug('teardown disconnected')
          resolve()
        })
      })
    })
    return logRecords!
  }
}
