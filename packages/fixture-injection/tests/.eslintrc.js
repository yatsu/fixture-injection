module.exports = {
  plugins: ['jest', 'node'],
  env: {
    'jest/globals': true
  },
  globals: {
    fixture: true,
    useFixture: true,
    nonuse: true
  },
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:node/recommended'],
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'func-names': ['error', 'as-needed', { generators: 'never' }],
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-shadow': 'off',
    semi: ['error', 'never']
  }
}
