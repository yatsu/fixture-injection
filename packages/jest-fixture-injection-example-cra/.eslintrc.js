module.exports = {
  extends: ['react-app'],
  globals: {
    fixture: true,
    useFixture: true,
    nonuse: true
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/tests/*.js'] }]
  }
}
