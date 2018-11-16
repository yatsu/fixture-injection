// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const jasmine2 = require('jest-jasmine2')

async function fixtureInjectableJasmine2(globalConfig, config, environment, runtime, testPath) {
  environment.global.useFixture = fn => environment.fixtureInjector.useFixture(
    fn,
    environment.global.beforeAll,
    environment.global.afterAll
  )
  const result = await jasmine2(globalConfig, config, environment, runtime, testPath)
  return result
}

module.exports = fixtureInjectableJasmine2
