const path = require('path')
const process = require('process')
const ipc = require('node-ipc')
const {
  IPC_SERVER_ID,
  IPC_CLIENT_ID,
  IPC_DEFAULT_OPTIONS,
  constructDependencyMap,
  fixtureArguments,
  fixturePromise
} = require('./common')

class FixtureServer {
  constructor(rootDir, ipcOptions = {}) {
    this.rootDir = rootDir
    this.fixturesPath = null
    this.ipcOptions = Object.assign({}, IPC_DEFAULT_OPTIONS, ipcOptions)
    this.fixtures = null
    this.dependencyMap = null
    this.fixtureTimestamps = { SETUP: {}, TEARDOWN: {} }
    this.funcTimestamps = {}
  }

  load(fixturesPath) {
    this.fixturesPath = path.isAbsolute(fixturesPath)
      ? fixturesPath
      : path.resolve(this.rootDir, fixturesPath)
    delete require.cache[require.resolve(this.fixturesPath)]
    this.fixtures = require(this.fixturesPath)
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
      Object.assign(ipc.config, this.ipcOptions, { id: IPC_SERVER_ID })

      ipc.serve(() => {
        ipc.server.on('dependencies', (_, socket) => {
          ipc.server.emit(socket, 'dependencies', this.dependencyMap)
        })

        ipc.server.on('fixture', ({ name }, socket) => {
          if (name in cachedObjects) {
            ipc.server.emit(socket, 'fixture', {
              name,
              fixture: cachedObjects[name]
            })
            return
          }

          if (name in fixturePromises) {
            fixturePromises[name].then((fixture) => {
              ipc.server.emit(socket, 'fixture', {
                name,
                fixture
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
              const initializedFixture = fixturePromise(
                fixtureDef,
                provide,
                fixtureArguments(fixtureDef).map(n => cachedObjects[n]),
                false,
                () => {
                  this.fixtureLog('SETUP', 'START', 'G', name)
                },
                () => {
                  this.fixtureLog('SETUP', 'END', 'G', name)
                },
                () => {
                  this.fixtureLog('TEARDOWN', 'START', 'G', name)
                },
                () => {
                  this.fixtureLog('TEARDOWN', 'END', 'G', name)
                }
              )
              finishPromises.push(initializedFixture)
              // fixture object will be resolved later
            })

            fixturePromises[name].then((fixture) => {
              ipc.server.emit(socket, 'fixture', {
                name,
                fixture
              })
            })
          })
        })

        ipc.server.on('log', ({ type, payload }) => {
          if (type === 'fixture') {
            const {
              operation, event, scope, name
            } = payload
            this.fixtureLog(operation, event, scope, name)
          } else {
            const { event, desc } = payload
            if (event === 'START') {
              this.funcTimestamps[desc] = Date.now()
              console.log(`[${this.funcTimestamps[desc]}] ${event} ${desc}`)
            } else {
              const time = Date.now()
              const diff = Math.floor((time - this.funcTimestamps[desc]) / 1000)
              console.log(`[${time}] ${event} ${desc} (${diff}ms)`)
            }
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

  fixtureLog(operation, event, scope, name) {
    if (process.env.FI_LOGGING !== '1') return
    const time = Date.now()
    if (event === 'START') {
      this.fixtureTimestamps[operation][name] = time
      console.log(`[${time}] ${operation} ${event} [${scope}] ${name}`)
    } else {
      const diff = time - this.fixtureTimestamps[operation][name]
      console.log(`[${time}] ${operation} ${event} [${scope}] ${name} (${diff}ms)`)
    }
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
