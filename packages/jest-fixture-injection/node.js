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
    this.fixtureContext = null
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
    if (!this.global.expect) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    if (!this.fixtureContext) {
      const {
        describe, it, test, xtest, beforeAll, afterAll
      } = this.global
      const context = vm.createContext(Object.assign({}, this.global))
      context.fixture = (name, fn) => this.injector.defineFixture(name, fn, beforeAll, afterAll)
      context.nonuse = () => null
      context.describe = (desc, fn) => {
        this.ancestors.push(desc)
        // eslint-disable-next-line max-len
        context.beforeAll = f => this.injector.beforeAll(f, beforeAll, afterAll, this.ancestors.slice())
        context.it = this.injector.injectableFn(it, this.ancestors.slice())
        context.it.skip = this.injector.injectableFn(it.skip, this.ancestors.slice())
        context.it.only = this.injector.injectableFn(it.only, this.ancestors.slice())
        context.test = this.injector.injectableFn(test, this.ancestors.slice())
        context.test.skip = this.injector.injectableFn(test.skip, this.ancestors.slice())
        context.test.only = this.injector.injectableFn(test.only, this.ancestors.slice())
        context.xtest = this.injector.injectableFn(xtest, this.ancestors.slice())
        // eslint-disable-next-line jest/valid-describe
        describe(desc, fn)
        this.ancestors.pop()
      }
      this.fixtureContext = context
    }

    return script.runInContext(this.fixtureContext)
  }
}

module.exports = fixtureInjectionEnvironment
