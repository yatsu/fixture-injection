module.exports = {
  plugins: ['jasmine'],
  env: {
    jasmine: true
  },
  extends: ['airbnb-base', 'plugin:jasmine/recommended'],
  globals: {
    fixture: true,
    useFixture: true,
    nonuse: true
  },
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-shadow': 'off',
    semi: ['error', 'never'],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.spec.js', '**/spec/*[Ff]ixtures.js', '**/scripts/test-*'] }
    ],
    'import/prefer-default-export': 'off',
    'jasmine/no-suite-dupes': 'off',
    'jasmine/no-spec-dupes': 'off',
    'jasmine/no-suite-callback-args': 'off' // required by fixture injection
  }
}
