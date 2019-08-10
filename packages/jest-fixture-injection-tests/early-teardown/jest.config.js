module.exports = {
  preset: 'jest-fixture-injection',
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-fixture-injection/dist/jsdom',
      testMatch: ['<rootDir>/early-teardown/*.test.ts']
    },
    {
      displayName: 'node',
      testEnvironment: 'jest-fixture-injection/dist/node',
      testMatch: ['<rootDir>/early-teardown/*.test.ts']
    }
  ]
}
