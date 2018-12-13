const process = require('process')
const { FixtureInjector } = require('fixture-injection')

const env = jasmine.getEnv()

global.fixtureInjector = new FixtureInjector(process.cwd())

// eslint-disable-next-line max-len
global.fixture = (name, fn) => global.fixtureInjector.defineFixture(name, fn, env.beforeAll, env.afterAll)
global.beforeAll = fn => global.fixtureInjector.beforeAll(fn, env.beforeAll, env.afterAll)

global.it = global.fixtureInjector.injectableFn(global.it)
global.xit = global.fixtureInjector.injectableFn(global.xit)

global.nonuse = () => null
