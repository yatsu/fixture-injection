const path = require('path')
const ipc = require('node-ipc')
const {
  constructDependencyMap,
  fixtureArguments,
  fixtureObjectOrPromise,
  fixtureObjects,
  IPC_SERVER_ID,
  IPC_CLIENT_ID,
  IPC_DEFAULT_OPTIONS
} = require('./common')

class FixtureInjector {
  constructor(rootDir, useGlobalFixtureServer = false, ipcOptions = {}) {
    this.rootDir = rootDir
    this.useGlobalFixtureServer = useGlobalFixtureServer
    this.ipcOptions = Object.assign({}, IPC_DEFAULT_OPTIONS, ipcOptions)
    this.fixturesPath = null
    this.globalFixturesPath = null
    this.fixtures = {}
    this.dependencyMap = []
    this.inlineFixtures = []
    this.globalFixtures = {}
    this.globalFinishPromises = []
    this.globalFixtureObjects = {}
    this.globalFinish = new Promise((resolve) => {
      this.globalFinished = resolve
    })
    this.ipcResolvers = {}
  }

  load(globalFixtures, fixtures) {
    if (!this.useGlobalFixtureServer) {
      if (path.isAbsolute(globalFixtures)) {
        this.globalFixturesPath = globalFixtures
      } else {
        this.globalFixturesPath = path.resolve(this.rootDir, globalFixtures)
      }
      delete require.cache[require.resolve(this.globalFixturesPath)]
      this.globalFixtures = require(this.globalFixturesPath)
    }

    if (path.isAbsolute(fixtures)) {
      this.fixturesPath = fixtures
    } else {
      this.fixturesPath = path.resolve(this.rootDir, fixtures)
    }

    this.fixtures = require(this.fixturesPath)
    delete require.cache[require.resolve(this.fixturesPath)]
  }

  nonGlobalFixtures() {
    return Object.assign({}, this.fixtures, this.inlineFixtures)
  }

  allFixtureDependencyMap() {
    return Object.assign({}, this.dependencyMap, constructDependencyMap(this.inlineFixtures))
  }

  defineFixture(name, fn, beforeAll, afterAll) {
    beforeAll(async () => {
      this.inlineFixtures[name] = fn
    })
    afterAll(async () => {
      delete this.inlineFixtures[name]
    })
  }

  clearInlineFixtures() {
    this.inlineFixtures = {}
  }

  beforeAll(fn, beforeAll, afterAll) {
    let finish
    beforeAll(async () => {
      finish = await this.callWithFixtures(fn)
    })
    afterAll(async () => {
      await finish()
    })
  }

  injectableRunnable(origFn) {
    return (desc, fn) => origFn(desc, async () => {
      const finish = await this.callWithFixtures(fn)
      await finish()
    })
  }

  setup() {
    if (this.useGlobalFixtureServer) {
      return new Promise((connectionResolve) => {
        Object.assign(ipc.config, this.ipcOptions, { id: IPC_CLIENT_ID })

        ipc.connectTo(IPC_SERVER_ID, () => {
          ipc.of[IPC_SERVER_ID].on('connect', () => {
            ipc.of[IPC_SERVER_ID].emit('dependencies')
          })

          ipc.of[IPC_SERVER_ID].on('dependencies', (dependencyMap) => {
            this.dependencyMap = Object.assign(
              {},
              dependencyMap,
              constructDependencyMap(this.fixtures)
            )
            connectionResolve()
          })

          ipc.of[IPC_SERVER_ID].on('fixture', ({ name, fixture, error }) => {
            this.ipcResolvers[name].forEach((fixtureResolve) => {
              if (error) {
                fixtureResolve(new Error(error))
              } else {
                fixtureResolve(fixture)
              }
            })
            this.ipcResolvers[name] = []
          })
        })
      })
    }

    this.dependencyMap = constructDependencyMap(
      Object.assign({}, this.globalFixtures, this.fixtures)
    )
    return Promise.resolve()
  }

  teardown() {
    if (this.useGlobalFixtureServer) {
      return new Promise((resolve) => {
        ipc.of[IPC_SERVER_ID].on('disconnect', () => {
          resolve()
        })
        ipc.disconnect(IPC_SERVER_ID)
      })
    }

    this.globalFinished()
    return Promise.all(this.globalFinishPromises)
  }

  async callWithFixtures(fn, ...args) {
    let fnFinished
    const fnFinish = new Promise((resolve) => {
      fnFinished = resolve
    })
    const finishPromises = []

    const dependencyMap = this.allFixtureDependencyMap()
    const fixtureNames = fixtureArguments(fn, dependencyMap)

    const constructFixturePromise = (fname, dependenciesPromise) => new Promise((resolve) => {
      if (!(fname in this.nonGlobalFixtures()) && fname in this.globalFixtureObjects) {
        resolve(this.globalFixtureObjects[fname])
        return
      }
      dependenciesPromise.then((dependencies) => {
        const provide = (fixture) => {
          resolve(fixture)
          return fnFinish
        }
        const globalProvide = (fixture) => {
          this.globalFixtureObjects[fname] = fixture
          resolve(fixture)
          return this.globalFinish
        }
        const { initializedFixture, isGlobal } = this.initFixture(
          fname,
          provide,
          globalProvide,
          dependencies
        )
        if (typeof initializedFixture.then === 'function') {
          // it is a promise
          if (isGlobal) {
            this.globalFinishPromises.push(initializedFixture)
          } else {
            finishPromises.push(initializedFixture)
          }
          // fixture object will be resolved later
        } else {
          // it is a fixture object
          if (isGlobal) {
            this.globalFixtureObjects[fname] = initializedFixture
          }
          // resolve fixture object immediately
          resolve(initializedFixture)
        }
      })
    })

    const objects = await fixtureObjects(fixtureNames, dependencyMap, constructFixturePromise)

    await fn(...objects, ...args)
    return async () => {
      fnFinished()
      await Promise.all(finishPromises)
    }
  }

  initFixture(name, provide, globalProvide, dependencies) {
    const localFixtureDef = this.nonGlobalFixtures()[name]
    if (localFixtureDef !== undefined) {
      return {
        initializedFixture: fixtureObjectOrPromise(
          localFixtureDef,
          provide,
          fixtureArguments(localFixtureDef).map(n => dependencies.find(d => d.name === n).fixture)
        ),
        isGlobal: false
      }
    }

    if (this.useGlobalFixtureServer) {
      const promise = new Promise((resolve) => {
        if (!(name in this.ipcResolvers)) {
          this.ipcResolvers[name] = []
        }
        this.ipcResolvers[name].push((fixture) => {
          if (fixture instanceof Error) {
            throw fixture
          }
          // Global fixtures should be frozen even though Jest freezes them
          const frozenFixture = Object.freeze(fixture)
          globalProvide(frozenFixture)
          resolve(frozenFixture)
        })
      })
      ipc.of[IPC_SERVER_ID].emit('fixture', { name })
      return { initializedFixture: promise, isGlobal: true }
    }

    const globalFixtureDef = this.globalFixtures[name]
    if (globalFixtureDef === undefined) {
      throw Error(`Undefined fixture '${name}'`)
    }
    return {
      initializedFixture: fixtureObjectOrPromise(
        globalFixtureDef,
        // Global fixtures should be frozen in Jasmine
        fixture => globalProvide(Object.freeze(fixture)),
        fixtureArguments(globalFixtureDef).map(n => dependencies.find(d => d.name === n).fixture),
        true
      ),
      isGlobal: true
    }
  }
}

module.exports = FixtureInjector
