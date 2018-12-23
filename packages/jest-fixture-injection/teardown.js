const process = require('process')
const { FixtureServer } = require('fixture-injection')
const { LocalLogger } = require('fixture-injection/logger')

async function teardown() {
  const logs = await FixtureServer.teardown()
  if (process.env.FI_LOGGING === '1') {
    const logger = new LocalLogger(logs)
    logger.writeAll()
  }
}

module.exports = teardown
