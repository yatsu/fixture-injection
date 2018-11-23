const path = require('path')
const ipc = require('node-ipc')
const {
  constructDependencyMap,
  fixtureArguments,
  fixtureObjectOrPromise,
  IPC_SERVER_ID,
  IPC_CLIENT_ID
} = require('./common')

class FixtureServer {
  constructor(rootDir) {
    this.rootDir = rootDir
    this.fixtures = null
    this.dependencyMap = null
  }

  load(fixturesPath) {
    if (path.isAbsolute(fixturesPath)) {
      this.fixtures = require(fixturesPath)
    } else {
      this.fixtures = require(path.resolve(this.rootDir, fixturesPath))
    }
    this.dependencyMap = constructDependencyMap(this.fixtures)
  }

  async start() {
    const cachedObjects = {}

    let runnerFinished
    const runnerFinish = new Promise((resolve) => {
      runnerFinished = resolve
    })

    const fixturePromises = {}
    const finishPromises = []

    const startupPromise = new Promise((startupResolve) => {
      ipc.config.id = 'fixture-injection-server'
      ipc.config.silent = true
      ipc.serve(() => {
        ipc.server.on('message', ({ type, payload }, socket) => {
          if (type === 'dependencies') {
            ipc.server.emit(socket, 'message', {
              type: 'dependencies',
              payload: {
                dependencyMap: this.dependencyMap
              }
            })
          } else if (type === 'fixture') {
            const { name } = payload
            if (name in cachedObjects) {
              ipc.server.emit(socket, 'message', {
                type: 'fixture',
                payload: { name, fixture: cachedObjects[name] }
              })
              return
            }

            if (name in fixturePromises) {
              fixturePromises[name].then((fixture) => {
                ipc.server.emit(socket, 'message', {
                  type: 'fixture',
                  payload: { name, fixture }
                })
              })
              return
            }

            Promise.all(this.dependencyMap[name].map(n => fixturePromises[n])).then(() => {
              fixturePromises[name] = new Promise((fixtureResolve) => {
                const fixtureDef = this.fixtures[name]
                const provide = (fixture) => {
                  cachedObjects[name] = fixture
                  fixtureResolve(fixture)
                  return runnerFinish
                }
                const initializedFixture = fixtureObjectOrPromise(
                  fixtureDef,
                  provide,
                  fixtureArguments(fixtureDef).map(n => cachedObjects[n])
                )
                if (typeof initializedFixture.then === 'function') {
                  // it is a promise
                  finishPromises.push(initializedFixture)
                  // fixture object will be resolved later
                } else {
                  // it is a fixture object
                  // resolve fixture object immediately
                  fixtureResolve(initializedFixture)
                }
              })

              fixturePromises[name].then((fixture) => {
                ipc.server.emit(socket, 'message', {
                  type: 'fixture',
                  payload: { name, fixture }
                })
              })
            })
          }
        })
        ipc.server.on('teardown', () => {
          runnerFinished()
          Promise.all(finishPromises).then(() => {
            ipc.server.stop()
          })
        })
        startupResolve()
      })
      ipc.server.start()
    })
    await startupPromise
  }

  static async teardown() {
    await new Promise((resolve) => {
      ipc.config.id = IPC_CLIENT_ID
      ipc.config.silent = true
      ipc.connectTo(IPC_SERVER_ID, () => {
        ipc.of[IPC_SERVER_ID].on('connect', () => {
          ipc.of[IPC_SERVER_ID].emit('teardown')
          ipc.disconnect(IPC_SERVER_ID)
        })
        ipc.of[IPC_SERVER_ID].on('disconnect', () => {
          resolve()
        })
      })
    })
  }
}

module.exports = FixtureServer
