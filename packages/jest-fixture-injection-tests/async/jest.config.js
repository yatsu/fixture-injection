module.exports = {
  preset: 'jest-fixture-injection',
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-fixture-injection/jsdom',
      testMatch: ['<rootDir>/**/*.test.js']
    },
    {
      displayName: 'node',
      testEnvironment: 'jest-fixture-injection/node',
      testMatch: ['<rootDir>/**/*.test.js']
    }
  ]
}
