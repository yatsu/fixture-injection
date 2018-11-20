const process = require('process')
const { FixtureInjector } = require('fixture-injection')

const env = jasmine.getEnv()

global.fixtureInjector = new FixtureInjector(process.cwd())

global.useFixture = fn => global.fixtureInjector.useFixture(fn, env.beforeAll, env.afterAll)

global.it = global.fixtureInjector.injectableRunnable(global.it)
global.xit = global.fixtureInjector.injectableRunnable(global.xit)
