const path = require('path')

function loadFixtures(fixturePath) {
  return require(path.resolve(path.dirname(require.main.filename), fixturePath))
}

class FixtureInjectionReporter {
  constructor(options = {}) {
    this.options = options
  }

  async jasmineStarted() {
    const { globalFixtures, fixtures } = this.options
    global.fixtureInjector.load(
      globalFixtures ? loadFixtures(globalFixtures) : undefined,
      fixtures ? loadFixtures(fixtures) : undefined
    )
    await global.fixtureInjector.setup()
  }

  async jasmineDone() {
    await global.fixtureInjector.teardown()
    // eslint-disable-next-line
    global.fixtureInjector.logger.writeAll(console.log)
  }
}

module.exports = FixtureInjectionReporter
