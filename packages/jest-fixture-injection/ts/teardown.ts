import process from 'process'

import { LocalLogger, FixtureServer } from 'fixture-injection'

export default async function teardown(): Promise<void> {
  const logs = await FixtureServer.teardown()
  if (process.env.FI_LOGGING === '1') {
    const logger = new LocalLogger(logs)
    logger.writeAll()
  }
}
