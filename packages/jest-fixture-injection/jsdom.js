// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const JSDOMEnvironment = require('jest-environment-jsdom')
const { FixtureInjector } = require('fixture-injection')
const readConfig = require('./config')
const { replaceRootDirInPath } = require('./utils')

class fixtureInjectionEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config)

    this.rootDir = config.rootDir
  }

  async setup() {
    await super.setup()

    const { globalFixtures, fixtures } = await readConfig()
    this.fixtureInjector = new FixtureInjector(this.rootDir, true)

    this.fixtureInjector.load(
      replaceRootDirInPath(this.rootDir, globalFixtures),
      replaceRootDirInPath(this.rootDir, fixtures)
    )

    await this.fixtureInjector.setup()
  }

  async teardown() {
    await super.teardown()

    await this.fixtureInjector.teardown()
  }

  runScript(script) {
    if (!this.dom || !this.global.it) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    if (!this.global.fixture) {
      // eslint-disable-next-line max-len
      this.global.fixture = (name, fn) => this.fixtureInjector.defineFixture(name, fn, this.global.beforeAll, this.global.afterAll)
      // eslint-disable-next-line max-len
      this.global.useFixture = fn => this.fixtureInjector.useFixture(fn, this.global.beforeAll, this.global.afterAll)
      this.global.it = this.fixtureInjector.injectableRunnable(this.global.it)
      this.global.it.skip = this.fixtureInjector.injectableRunnable(this.global.it.skip)
      this.global.it.only = this.fixtureInjector.injectableRunnable(this.global.it.only)
      this.global.test = this.fixtureInjector.injectableRunnable(this.global.test)
      this.global.xtest = this.fixtureInjector.injectableRunnable(this.global.xtest)
      this.global.nonuse = () => null
    }

    return this.dom.runVMScript(script)
  }
}

module.exports = fixtureInjectionEnvironment
