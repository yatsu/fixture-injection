const { FixtureServer } = require('fixture-injection')

async function teardown() {
  await FixtureServer.teardown()
}

module.exports = teardown
