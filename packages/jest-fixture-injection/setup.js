const path = require('path')
const { FixtureServer } = require('fixture-injection')
const readConfig = require('./config')
const { replaceRootDirInPath } = require('./utils')

async function setup(config) {
  const { rootDir } = config
  const { globalFixtures } = await readConfig()

  const fixtureServer = new FixtureServer(rootDir)

  const replacedPath = replaceRootDirInPath(rootDir, globalFixtures)
  if (path.isAbsolute(replacedPath)) {
    fixtureServer.load(replacedPath)
  } else {
    fixtureServer.load(path.resolve(this.rootDir, replacedPath))
  }

  await fixtureServer.start()
}

module.exports = setup
