module.exports = {
  preset: 'jest-fixture-injection',
  testEnvironmentOptions: {
    fixtureInjection: {
      globalFixtures: '<rootDir>/tests/__global_fixtures__',
      fixtures: '<rootDir>/tests/__fixtures__'
    }
  }
}
