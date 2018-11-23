module.exports = {
  plugins: ['jest', 'node'],
  env: {
    'jest/globals': true
  },
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:node/recommended'],
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'global-require': 'off',
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    'no-template-curly-in-string': 'off',
    'no-underscore-dangle': 'off',
    semi: ['error', 'never'],
    'import/no-dynamic-require': 'off'
  }
}
