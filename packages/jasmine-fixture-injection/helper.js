const FixtureInjector = require('fixture-injection')

const env = jasmine.getEnv()

global.fixtureInjector = new FixtureInjector(env.beforeAll, env.afterAll)

global.useFixture = fn => global.fixtureInjector.useFixture(fn)

global.it = global.fixtureInjector.injectableRunnable(global.it)
global.xit = global.fixtureInjector.injectableRunnable(global.xit)
