import createDebug from 'debug'
import fs from 'fs'
import path from 'path'
import process from 'process'

const debug = createDebug('jest-fixture-injection:config')

export interface JestFixtureInjectionConfig {
  fixtures?: string
  globalFixtures?: string
  ipc?: any
}

const DEFAULT_CONFIG_PATHS = ['fixture-injection.config.js']

function readConfigFrom(configPath: string): JestFixtureInjectionConfig | undefined {
  const absConfigPath = path.resolve(configPath)
  debug('readConfigFrom: %s', absConfigPath)

  try {
    fs.statSync(absConfigPath)
  } catch (err) {
    if (err.code === 'ENOENT' && !process.env.FIXTURE_INJECTION_CONFIG) {
      return undefined
    } else {
      throw err
    }
  }
  return require(absConfigPath)
}

export function readConfig(): JestFixtureInjectionConfig {
  let config: JestFixtureInjectionConfig | undefined = undefined
  const configPath = process.env.FIXTURE_INJECTION_CONFIG
  debug('readConfig - configPath: %s', configPath)

  if (configPath) {
    config = readConfigFrom(configPath)
  } else {
    for (const path of DEFAULT_CONFIG_PATHS) {
      config = readConfigFrom(path)
      if (config) break
    }
  }

  if (!config) {
    throw new Error('Cannot read fixture-injection config')
  }

  debug('readConfig done - config: %o', config)
  return config
}
