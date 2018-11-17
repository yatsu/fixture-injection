const path = require('path')
const vm = require('vm')
// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const NodeEnvironment = require('jest-environment-node')
const FixtureInjector = require('fixture-injection')

function replaceRootDirInPath(rootDir, filePath) {
  if (!/^<rootDir>/.test(filePath)) {
    return filePath
  }
  return path.resolve(rootDir, path.normalize(`./${filePath.substr('<rootDir>'.length)}`))
}

class fixtureInjectionEnvironment extends NodeEnvironment {
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
    if (!this.global.it) {
      // The test env is not initialized yet
      return super.runScript(script)
    }

    // eslint-disable-next-line max-len
    const useFixture = fn => this.fixtureInjector.useFixture(fn, this.global.beforeAll, this.global.afterAll)
    const it = this.fixtureInjector.injectableRunnable(this.global.it)
    it.skip = this.fixtureInjector.injectableRunnable(this.global.it.skip)
    it.only = this.fixtureInjector.injectableRunnable(this.global.it.only)
    const test = this.fixtureInjector.injectableRunnable(this.global.test)
    const xtest = this.fixtureInjector.injectableRunnable(this.global.xtest)

    return script.runInContext(
      vm.createContext(
        Object.assign({}, this.global, {
          useFixture,
          it,
          test,
          xtest
        })
      )
    )
  }
}

module.exports = fixtureInjectionEnvironment
