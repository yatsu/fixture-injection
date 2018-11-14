class FixtureInjectionReporter {
  constructor(options = {}) {
    this.options = options
  }

  jasmineStarted() {
    const { globalFixtures, fixtures } = this.options
    global.fixtureContext.config(this.options)
    global.fixtureContext.load(globalFixtures, fixtures)
    global.fixtureContext.setup()
  }

  jasmineDone() {
    global.fixtureContext.teardown()
  }
}

module.exports = FixtureInjectionReporter
