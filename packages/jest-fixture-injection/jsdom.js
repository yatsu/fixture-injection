const path = require('path')
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const JSDOMEnvironment = require('jest-environment-jsdom')
const FixtureInjector = require('fixture-injection')

function replaceRootDirInPath(rootDir, filePath) {
  if (!/^<rootDir>/.test(filePath)) {
    return filePath
  }
  return path.resolve(rootDir, path.normalize(`./${filePath.substr('<rootDir>'.length)}`))
}

class fixtureInjectionEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config)

    const { rootDir } = config
    const { globalFixtures, fixtures } = config.testEnvironmentOptions.fixtureInjection
    this.fiConfig = { rootDir, globalFixtures, fixtures }
  }

  async setup() {
    await super.setup()

    const { rootDir, globalFixtures, fixtures } = this.fiConfig
    this.fixtureInjector = new FixtureInjector(null, null)

    this.fixtureInjector.load(
      replaceRootDirInPath(rootDir, globalFixtures),
      replaceRootDirInPath(rootDir, fixtures)
    )
  }

  runScript(script) {
    if (!this.dom || !this.global.it) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    // eslint-disable-next-line max-len
    this.global.useFixture = fn => this.fixtureInjector.useFixture(fn, this.global.beforeAll, this.global.afterAll)
    this.global.it = this.fixtureInjector.injectableRunnable(this.global.it)
    this.global.it.skip = this.fixtureInjector.injectableRunnable(this.global.it.skip)
    this.global.it.only = this.fixtureInjector.injectableRunnable(this.global.it.only)
    this.global.test = this.fixtureInjector.injectableRunnable(this.global.test)
    this.global.xtest = this.fixtureInjector.injectableRunnable(this.global.xtest)

    return this.dom.runVMScript(script)
  }
}

module.exports = fixtureInjectionEnvironment
