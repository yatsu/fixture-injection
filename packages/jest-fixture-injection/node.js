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

    // Define fixture-injection globals and verride Jest globals here
    // Jest globals: https://jestjs.io/docs/en/api
    // See also: jest-jasmine2/src/index.js
    //           jest-circus/src/index.js

    if (!this.fixtureContext) {
      const {
        describe,
        fdescribe,
        xdescribe,
        beforeAll,
        afterAll,
        it,
        test,
        xtest,
        fit,
        xit
      } = this.global
      const context = vm.createContext(Object.assign({}, this.global))

      context.fixture = (name, fn) => this.injector.defineFixture(name, fn, beforeAll, afterAll)
      context.nonuse = () => null

      const defineDesc = origDesc => (desc, fn) => {
        this.ancestors.push(desc)

        // eslint-disable-next-line max-len
        context.beforeAll = f => this.injector.beforeAll(f, beforeAll, afterAll, this.ancestors.slice())

        const defineTest = origFn => this.injector.injectableFn(origFn, this.ancestors.slice())

        context.test = defineTest(test)
        context.test.only = defineTest(test.only)
        context.test.skip = defineTest(test.skip)
        context.it = defineTest(it)
        context.it.only = defineTest(it.only)
        context.it.skip = defineTest(it.skip)
        context.xtest = defineTest(xtest)
        context.fit = defineTest(fit)
        context.xit = defineTest(xit)

        origDesc(desc, fn)

        this.ancestors.pop()
      }

      context.describe = defineDesc(describe)
      context.fdescribe = defineDesc(fdescribe)
      context.xdescribe = defineDesc(xdescribe)

      this.fixtureContext = context
    }

    return script.runInContext(this.fixtureContext)
  }
}

module.exports = fixtureInjectionEnvironment
