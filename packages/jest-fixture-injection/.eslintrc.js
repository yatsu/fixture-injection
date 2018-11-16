module.exports = {
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  extends: ['airbnb-base', 'plugin:jest/recommended', 'plugin:node/recommended'],
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'func-names': ['error', 'as-needed', { generators: 'never' }],
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    semi: ['error', 'never']
  }
}
