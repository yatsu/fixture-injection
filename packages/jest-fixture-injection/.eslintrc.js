module.exports = {
  plugins: ['jest', 'node'],
  env: {
    'jest/globals': true
  },
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:node/recommended'],
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'func-names': ['error', 'as-needed', { generators: 'never' }],
    'global-require': 'off',
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    semi: ['error', 'never'],
    'import/no-dynamic-require': 'off'
  }
}
