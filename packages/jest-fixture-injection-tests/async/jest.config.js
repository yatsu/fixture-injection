module.exports = {
  preset: 'jest-fixture-injection',
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jest-fixture-injection/dist/jsdom',
      testMatch: ['<rootDir>/async/*.test.ts']
    },
    {
      displayName: 'node',
      testEnvironment: 'jest-fixture-injection/dist/node',
      testMatch: ['<rootDir>/async/*.test.ts']
    }
  ]
}
