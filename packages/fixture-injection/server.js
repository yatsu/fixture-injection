const path = require('path')
const process = require('process')
const microtime = require('microtime')
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
    this.startTime = null
    this.logs = []
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
    this.startTime = microtime.now()

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
            const {
              label, desc, ancestors, fixtures, event
            } = payload
            this.fnLog(label, desc, ancestors, fixtures, event)
          }
        })

        ipc.server.on('teardown', (_, socket) => {
          runnerFinished()
          Promise.all(finishPromises).then(() => {
            const logs = this.logs.sort((x, y) => x[0] - y[0]).map(x => x[1])
            ipc.server.emit(socket, 'logs', logs)
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

    const time = microtime.now()
    let duration
    if (event === 'START') {
      this.fixtureTimestamps[operation][name] = time
    } else {
      duration = time - this.fixtureTimestamps[operation][name]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime,
        type: 'fixture',
        payload: {
          operation,
          event,
          scope,
          name,
          duration
        }
      }
    ])
  }

  fnLog(label, desc, ancestors, fixtures, event) {
    if (process.env.FI_LOGGING !== '1') return

    const time = microtime.now()
    const testPath = [ancestors.join(' -> '), desc].join(' -> ')
    let duration
    if (event === 'START') {
      this.funcTimestamps[testPath] = time
    } else {
      duration = time - this.funcTimestamps[testPath]
    }
    this.logs.push([
      time,
      {
        time: time - this.startTime,
        type: 'function',
        payload: {
          label,
          desc,
          ancestors,
          fixtures,
          event,
          duration
        }
      }
    ])
  }

  static async teardown() {
    let logRecords
    await new Promise((resolve) => {
      ipc.config.id = IPC_CLIENT_ID
      ipc.config.silent = true
      ipc.connectTo(IPC_SERVER_ID, () => {
        ipc.of[IPC_SERVER_ID].on('connect', () => {
          ipc.of[IPC_SERVER_ID].emit('teardown')
          ipc.of[IPC_SERVER_ID].on('logs', (logs) => {
            logRecords = logs
            ipc.disconnect(IPC_SERVER_ID)
          })
        })
        ipc.of[IPC_SERVER_ID].on('disconnect', () => {
          resolve()
        })
      })
    })
    return logRecords
  }
}

module.exports = FixtureServer
