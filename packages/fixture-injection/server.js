const path = require('path')
const ipc = require('node-ipc')
const { fixtureObjectOrPromise, IPC_SERVER_ID, IPC_CLIENT_ID } = require('./common')

class FixtureServer {
  constructor(rootDir) {
    this.rootDir = rootDir
    this.fixtures = null
  }

  load(fixturesPath) {
    if (path.isAbsolute(fixturesPath)) {
      this.fixtures = require(fixturesPath)
    } else {
      this.fixtures = require(path.resolve(this.rootDir, fixturesPath))
    }
  }

  async start() {
    const fixtureObjects = {}
    const fixtureFinishPromises = []
    const fixtureSockets = {}

    let runnerFinished
    const runnerFinish = new Promise((resolve) => {
      runnerFinished = resolve
    })

    const promise = new Promise((resolve) => {
      ipc.config.id = 'fixture-injection-server'
      ipc.config.silent = true
      ipc.serve(() => {
        ipc.server.on('message', ({ name }, socket) => {
          if (name in fixtureObjects) {
            ipc.server.emit(socket, 'message', { name, fixture: fixtureObjects[name] })
          } else if (name in fixtureSockets) {
            fixtureSockets[name].push(socket)
          } else {
            const fixtureDef = this.fixtures[name]
            if (fixtureDef === undefined) {
              ipc.server.emit(socket, 'message', { name, error: `Undefined fixture '${name}'` })
              return
            }
            const initializedFixture = fixtureObjectOrPromise(fixtureDef, (fixture) => {
              fixtureObjects[name] = fixture
              fixtureSockets[name].forEach((sock) => {
                ipc.server.emit(sock, 'message', { name, fixture })
              })
              fixtureSockets[name] = []
              return runnerFinish
            })
            if (initializedFixture.then instanceof Function) {
              // it is a promise
              if (!(name in fixtureSockets)) {
                fixtureSockets[name] = []
              }
              fixtureSockets[name].push(socket)
              fixtureFinishPromises.push(fixtureFinishPromises)
              // fixture object will be resolved later
            } else {
              // it is a fixture object
              // resolve fixture object immediately
              ipc.server.emit(socket, 'message', { name, initializedFixture })
            }
          }
        })
        ipc.server.on('teardown', () => {
          runnerFinished()
          Promise.all(fixtureFinishPromises).then(() => {
            ipc.server.stop()
          })
        })
        resolve()
      })
      ipc.server.start()
    })
    await promise
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
