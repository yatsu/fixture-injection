module.exports = {
  preset: 'jest-fixture-injection',
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-fixture-injection/jsdom',
      testMatch: ['<rootDir>/jsdom/**/*.test.js']
    },
    {
      displayName: 'node',
      testEnvironment: 'jest-fixture-injection/node',
      testMatch: ['<rootDir>/node/**/*.test.js']
    }
  ]
}
