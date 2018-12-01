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

    const { globalFixtures, fixtures, ipc } = await readConfig()
    this.fixtureInjector = new FixtureInjector(this.rootDir, true, ipc)

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
      const {
        it, test, xtest, beforeAll, afterAll
      } = this.global
      // eslint-disable-next-line max-len
      this.global.fixture = (name, fn) => this.fixtureInjector.defineFixture(name, fn, this.global.beforeAll, this.global.afterAll)
      // eslint-disable-next-line max-len
      this.global.beforeAll = fn => this.fixtureInjector.beforeAll(fn, beforeAll, afterAll)
      this.global.it = this.fixtureInjector.injectableRunnable(it)
      this.global.it.skip = this.fixtureInjector.injectableRunnable(it.skip)
      this.global.it.only = this.fixtureInjector.injectableRunnable(it.only)
      this.global.test = this.fixtureInjector.injectableRunnable(test)
      this.global.test.skip = this.fixtureInjector.injectableRunnable(test.skip)
      this.global.test.only = this.fixtureInjector.injectableRunnable(test.only)
      this.global.xtest = this.fixtureInjector.injectableRunnable(xtest)
      this.global.nonuse = () => null
    }

    return this.dom.runVMScript(script)
  }
}

module.exports = fixtureInjectionEnvironment
