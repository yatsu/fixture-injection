module.exports = {
  jest: {
    configure: (jestConfig) => Object.assign({}, jestConfig, {
      preset: 'jest-fixture-injection',
      // testEnvironment: 'jest-fixture-injection/jsdom', // does not work
      testMatch: [...jestConfig.testMatch, '<rootDir>/tests/**/?(*.)(spec|test).{js,jsx,ts,tsx}']
    })
  }
}
