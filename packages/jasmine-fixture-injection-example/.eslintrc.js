module.exports = {
  plugins: ['jasmine'],
  env: {
    jasmine: true
  },
  extends: ['airbnb-base', 'plugin:jasmine/recommended'],
  globals: {
    useFixture: true
  },
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-shadow': 'off',
    semi: ['error', 'never'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.js'] }],
    'import/prefer-default-export': 'off',
    'jasmine/no-suite-callback-args': 'off' // required by fixture injection
  }
}
