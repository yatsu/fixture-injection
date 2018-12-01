const vm = require('vm')
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const NodeEnvironment = require('jest-environment-node')
const { FixtureInjector } = require('fixture-injection')
const readConfig = require('./config')
const { replaceRootDirInPath } = require('./utils')

class fixtureInjectionEnvironment extends NodeEnvironment {
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
    if (!this.global.it) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    // eslint-disable-next-line max-len
    const fixture = (name, fn) => this.fixtureInjector.defineFixture(name, fn, this.global.beforeAll, this.global.afterAll)
    // eslint-disable-next-line max-len
    const beforeAll = fn => this.fixtureInjector.beforeAll(fn, this.global.beforeAll, this.global.afterAll)
    const it = this.fixtureInjector.injectableRunnable(this.global.it)
    it.skip = this.fixtureInjector.injectableRunnable(this.global.it.skip)
    it.only = this.fixtureInjector.injectableRunnable(this.global.it.only)
    const test = this.fixtureInjector.injectableRunnable(this.global.test)
    test.skip = this.fixtureInjector.injectableRunnable(this.global.test.skip)
    test.only = this.fixtureInjector.injectableRunnable(this.global.test.only)
    const xtest = this.fixtureInjector.injectableRunnable(this.global.xtest)
    const nonuse = () => null

    return script.runInContext(
      vm.createContext(
        Object.assign({}, this.global, {
          fixture,
          beforeAll,
          it,
          test,
          xtest,
          nonuse
        })
      )
    )
  }
}

module.exports = fixtureInjectionEnvironment
