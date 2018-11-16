class FixtureInjectionReporter {
  constructor(options = {}) {
    this.options = options
  }

  jasmineStarted() {
    const { globalFixtures, fixtures } = this.options
    global.fixtureInjector.load(globalFixtures, fixtures)
    global.fixtureInjector.setup()
  }

  jasmineDone() {
    global.fixtureInjector.teardown()
  }
}

module.exports = FixtureInjectionReporter
