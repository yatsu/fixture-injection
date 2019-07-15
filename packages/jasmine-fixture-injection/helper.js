const process = require('process')
const { FixtureInjector } = require('fixture-injection')

const env = jasmine.getEnv()

global.fixtureInjector = new FixtureInjector(process.cwd())

// eslint-disable-next-line max-len
global.fixture = (name, fn) => global.fixtureInjector.defineFixture(name, fn, env.beforeAll, env.afterAll)
global.nonuse = () => null

const {
  describe, fdescribe, xdescribe, it, fit, xit
} = global

const ancestors = []

const defineDesc = origDesc => (desc, fn) => {
  ancestors.push(desc)

  // eslint-disable-next-line max-len
  global.beforeAll = f => global.fixtureInjector.beforeAll(f, env.beforeAll, env.afterAll, ancestors.slice())

  const defineTest = origFn => global.fixtureInjector.injectableFn(origFn, ancestors.slice())

  global.it = defineTest(it)
  global.fit = defineTest(fit)
  global.xit = defineTest(xit)

  origDesc(desc, fn)

  ancestors.pop()
}

global.describe = defineDesc(describe)
global.fdescribe = defineDesc(fdescribe)
global.xdescribe = defineDesc(xdescribe)
