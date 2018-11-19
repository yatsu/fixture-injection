const path = require('path')
const process = require('process')
const getArguments = require('es-arguments')
const ipc = require('node-ipc')

const IPC_SERVER_ID = 'fixture-injection-server'
const IPC_CLIENT_ID = 'fixture-injection-client'

class FixtureInjector {
  constructor(rootDir, useGlobalFixtureServer = false) {
    this.rootDir = rootDir
    this.useGlobalFixtureServer = useGlobalFixtureServer
    this.globalFixtures = {}
    this.fixtures = {}
    this.globalFinishPromises = []
    this.finished = false
    this.globalFixtureObjects = {}
    this.globalFinish = new Promise((resolve) => {
      this.globalFinished = resolve
    })
    this.ipcResolvers = {}
  }

  load(globalFixtures, fixtures) {
    if (!this.useGlobalFixtureServer) {
      if (path.isAbsolute(globalFixtures)) {
        this.globalFixtures = require(globalFixtures)
      } else {
        this.globalFixtures = require(path.resolve(this.rootDir, globalFixtures))
      }
    }
    if (path.isAbsolute(fixtures)) {
      this.fixtures = require(fixtures)
    } else {
      this.fixtures = require(path.resolve(process.cwd(), fixtures))
    }
  }

  useFixture(fn, beforeAll, afterAll) {
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
      return new Promise((resolve) => {
        ipc.config.id = IPC_CLIENT_ID
        ipc.config.silent = true
        ipc.connectTo(IPC_SERVER_ID, () => {
          ipc.of[IPC_SERVER_ID].on('connect', () => {
            resolve()
          })
          ipc.of[IPC_SERVER_ID].on('message', ({ name, fixture, error }) => {
            this.ipcResolvers[name].forEach((resolve) => {
              if (error) {
                resolve(new Error(error))
              } else {
                resolve(fixture)
              }
            })
            this.ipcResolvers[name] = []
          })
        })
      })
    }

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
    let finished
    const finish = new Promise((resolve) => {
      finished = resolve
    })
    const promises = []
    const fixtureObjects = await Promise.all(
      getArguments(fn).map(
        arg => new Promise((resolve) => {
          if (!(arg in this.fixtures) && arg in this.globalFixtureObjects) {
            resolve(this.globalFixtureObjects[arg])
            return
          }
          const provide = (fixture) => {
            resolve(fixture)
            return finish
          }
          const globalProvide = (fixture) => {
            this.globalFixtureObjects[arg] = fixture
            resolve(fixture)
            return this.globalFinish
          }
          const { fixtureOrPromise, isGlobal } = this.initFixture(arg, provide, globalProvide)
          if (fixtureOrPromise.then instanceof Function) {
            // it is a promise
            if (isGlobal) {
              this.globalFinishPromises.push(fixtureOrPromise)
            } else {
              promises.push(fixtureOrPromise)
            }
            // fixture object will be resolved later
          } else {
            // it is a fixture object
            if (isGlobal) {
              this.globalFixtureObjects[arg] = fixtureOrPromise
            }
            // resolve fixture object immediately
            resolve(fixtureOrPromise)
          }
        })
      )
    )
    await fn(...fixtureObjects, ...args)
    return async () => {
      finished()
      await Promise.all(promises)
    }
  }

  initFixture(name, provide, globalProvide) {
    const localFixtureDef = this.fixtures[name]
    if (localFixtureDef !== undefined) {
      return {
        fixtureOrPromise: FixtureInjector.fixtureOrPromise(localFixtureDef, provide),
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
          globalProvide(fixture)
          resolve(fixture)
        })
      })
      ipc.of[IPC_SERVER_ID].emit('message', { name })
      return { fixtureOrPromise: promise, isGlobal: true }
    }

    const globalFixtureDef = this.globalFixtures[name]
    if (globalFixtureDef === undefined) {
      throw Error(`Undefined fixture '${name}'`)
    }
    return {
      fixtureOrPromise: FixtureInjector.fixtureOrPromise(globalFixtureDef, globalProvide),
      isGlobal: true
    }
  }

  static fixtureOrPromise(fixtureDef, provide) {
    if (fixtureDef instanceof Function) {
      return fixtureDef(provide)
    }
    return fixtureDef
  }
}

module.exports = FixtureInjector
