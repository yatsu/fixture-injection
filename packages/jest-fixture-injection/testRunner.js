// eslint-disable-next-line import/no-extraneous-dependencies, node/no-extraneous-require
const jasmine2 = require('jest-jasmine2')

async function fixtureInjectableJasmine2(globalConfig, config, environment, runtime, testPath) {
  environment.global.useFixture = (fn) => {
    let finish
    environment.global.beforeAll(async () => {
      finish = await environment.fixtureInjector.callWithFixtures(fn)
    })
    environment.global.afterAll(async () => {
      await finish()
    })
  }
  const result = await jasmine2(globalConfig, config, environment, runtime, testPath)
  return result
}

module.exports = fixtureInjectableJasmine2
