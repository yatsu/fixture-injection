// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const JSDOMEnvironment = require('jest-environment-jsdom')
const { FixtureInjector } = require('fixture-injection')
const readConfig = require('./config')
const { replaceRootDirInPath } = require('./utils')

class fixtureInjectionEnvironment extends JSDOMEnvironment {
  constructor(config) {
    super(config)

    this.rootDir = config.rootDir
    this.ancestors = []
  }

  async setup() {
    await super.setup()

    const { globalFixtures, fixtures, ipc } = await readConfig()
    this.injector = new FixtureInjector(this.rootDir, true, ipc)

    this.injector.load(
      replaceRootDirInPath(this.rootDir, globalFixtures),
      replaceRootDirInPath(this.rootDir, fixtures)
    )

    await this.injector.setup()
  }

  async teardown() {
    await super.teardown()

    await this.injector.teardown()
  }

  runScript(script) {
    if (!this.dom || !this.global.expect) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    if (!this.global.fixture) {
      const {
        describe, it, test, xtest, beforeAll, afterAll
      } = this.global
      this.global.fixture = (name, fn) => this.injector.defineFixture(name, fn, beforeAll, afterAll)
      this.global.nonuse = () => null
      this.global.describe = (desc, fn) => {
        this.ancestors.push(desc)
        // eslint-disable-next-line max-len
        this.global.beforeAll = f => this.injector.beforeAll(f, beforeAll, afterAll, this.ancestors.slice())
        this.global.it = this.injector.injectableFn(it, this.ancestors.slice())
        this.global.it.skip = this.injector.injectableFn(it.skip, this.ancestors.slice())
        this.global.it.only = this.injector.injectableFn(it.only, this.ancestors.slice())
        this.global.test = this.injector.injectableFn(test, this.ancestors.slice())
        this.global.test.skip = this.injector.injectableFn(test.skip, this.ancestors.slice())
        this.global.test.only = this.injector.injectableFn(test.only, this.ancestors.slice())
        this.global.xtest = this.injector.injectableFn(xtest, this.ancestors.slice())
        // eslint-disable-next-line jest/valid-describe
        describe(desc, fn)
        this.ancestors.pop()
      }
    }

    return this.dom.runVMScript(script)
  }
}

module.exports = fixtureInjectionEnvironment
