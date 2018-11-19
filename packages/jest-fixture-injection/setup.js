const path = require('path')
const ipc = require('node-ipc')
const FixtureInjector = require('fixture-injection')
const readConfig = require('./config')
const { replaceRootDirInPath } = require('./utils')

function loadFixtures(rootDir, fixturesPath) {
  const replacedPath = replaceRootDirInPath(rootDir, fixturesPath)
  if (path.isAbsolute(replacedPath)) {
    return require(replacedPath)
  }
  return require(path.resolve(this.rootDir, replacedPath))
}

async function setup(config) {
  const { rootDir } = config
  const { globalFixtures } = await readConfig()

  const fixtures = loadFixtures(rootDir, globalFixtures)
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
          const fixtureDef = fixtures[name]
          if (fixtureDef === undefined) {
            ipc.server.emit(socket, 'message', { name, error: `Undefined fixture '${name}'` })
            return
          }
          const fixtureOrPromise = FixtureInjector.fixtureOrPromise(fixtureDef, (fixture) => {
            fixtureObjects[name] = fixture
            fixtureSockets[name].forEach((sock) => {
              ipc.server.emit(sock, 'message', { name, fixture })
            })
            fixtureSockets[name] = []
            return runnerFinish
          })
          if (fixtureOrPromise.then instanceof Function) {
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
            ipc.server.emit(socket, 'message', { name, fixtureOrPromise })
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

module.exports = setup
