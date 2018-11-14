const FixtureContext = require('fixture-injection')

global.fixtureContext = new FixtureContext(jasmine.getEnv())

global.useFixture = fn => global.fixtureContext.useFixture(fn)

global.it = global.fixtureContext.injectableRunnable(global.it)
global.xit = global.fixtureContext.injectableRunnable(global.xit)
