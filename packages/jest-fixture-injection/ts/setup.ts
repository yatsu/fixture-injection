import { Config } from '@jest/types'
import createDebug from 'debug'
import { FixtureServer } from 'fixture-injection'

import { loadFixtures, replaceRootDirInPath } from './common'
import { readConfig } from './config'

const debug = createDebug('jest-fixture-injection:setup')

export default async function setup(config: Config.ProjectConfig): Promise<void> {
  debug('start - config: %o', config)
  const fixtureConfig = await readConfig()
  const { globalFixtures, ipc } = fixtureConfig

  if (globalFixtures) {
    debug('loading fixtures: %s', globalFixtures)
    // config object of globalSetup does not have `cacheDirectory` and `transform`
    debug('setup config: %o', config)
    const loadedFixtures = await loadFixtures(
      {
        ...config,
        cacheDirectory: '/tmp/fixture-injection',
        transform: [
          [
            '^.+\\.[jt]sx?$',
            replaceRootDirInPath(config.rootDir, '<rootDir>/node_modules/babel-jest/build/index.js')
          ]
        ]
      },
      globalFixtures
    )
    debug('loaded fixtures: %o', Object.keys(loadedFixtures))
    debug('launching fixture server - ipc: %o', ipc)
    const fixtureServer = new FixtureServer(loadedFixtures, ipc)
    await fixtureServer.start()
  }

  debug('finish')
}
