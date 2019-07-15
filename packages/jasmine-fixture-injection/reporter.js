const path = require('path')

class FixtureInjectionReporter {
  constructor(options = {}) {
    this.options = options
  }

  async jasmineStarted() {
    const { globalFixtures, fixtures } = this.options
    global.fixtureInjector.load(
      path.resolve(path.dirname(require.main.filename), globalFixtures),
      path.resolve(path.dirname(require.main.filename), fixtures)
    )
    await global.fixtureInjector.setup()
  }

  async jasmineDone() {
    await global.fixtureInjector.teardown()
    global.fixtureInjector.logger.writeAll(console.log)
  }
}

module.exports = FixtureInjectionReporter
