const fs = require('fs')
const path = require('path')
const process = require('process')

const DEFAULT_CONFIG_PATH = 'fixture-injection.config.js'

const DEFAULT_CONFIG = {
  fixtures: '<rootDir>/tests/__fixtures__',
  globalFixtures: '<rootDir>/tests/__global_fixtures__'
}

async function readConfig() {
  const configPath = process.env.FIXTURE_INJECTION_CONFIG || DEFAULT_CONFIG_PATH
  const absConfigPath = path.resolve(configPath)

  try {
    fs.statSync(absConfigPath)
  } catch (err) {
    if (err.code === 'ENOENT' && !process.env.FIXTURE_INJECTION_CONFIG) {
      return DEFAULT_CONFIG
    }
    throw err
  }
  return Object.assign({}, DEFAULT_CONFIG, require(absConfigPath))
}

module.exports = readConfig
