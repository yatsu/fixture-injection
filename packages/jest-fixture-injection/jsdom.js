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

    // Define fixture-injection globals and verride Jest globals here
    // Jest globals: https://jestjs.io/docs/en/api
    // See also: jest-jasmine2/src/index.js
    //           jest-circus/src/index.js

    if (!this.global.fixture) {
      const {
        describe,
        fdescribe,
        xdescribe,
        beforeAll,
        afterAll,
        test,
        it,
        xtest,
        fit,
        xit
      } = this.global

      this.global.fixture = (name, fn) => this.injector.defineFixture(name, fn, beforeAll, afterAll)
      this.global.nonuse = () => null

      const defineDesc = origDesc => (desc, fn) => {
        this.ancestors.push(desc)

        // eslint-disable-next-line max-len
        this.global.beforeAll = f => this.injector.beforeAll(f, beforeAll, afterAll, this.ancestors.slice())

        const defineTest = origFn => this.injector.injectableFn(origFn, this.ancestors.slice())

        this.global.test = defineTest(test)
        this.global.test.only = defineTest(test.only)
        this.global.test.skip = defineTest(test.skip)
        this.global.it = defineTest(it)
        this.global.it.only = defineTest(it.only)
        this.global.it.skip = defineTest(it.skip)
        this.global.xtest = defineTest(xtest)
        this.global.fit = defineTest(fit)
        this.global.xit = defineTest(xit)

        origDesc(desc, fn)

        this.ancestors.pop()
      }

      this.global.describe = defineDesc(describe)
      this.global.fdescribe = defineDesc(fdescribe)
      this.global.xdescribe = defineDesc(xdescribe)
    }

    return this.dom.runVMScript(script)
  }
}

module.exports = fixtureInjectionEnvironment
