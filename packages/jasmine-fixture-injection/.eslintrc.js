module.exports = {
  extends: ['airbnb-base', 'plugin:node/recommended'],
  globals: {
    jasmine: true
  },
  rules: {
    'class-methods-use-this': 'off',
    'comma-dangle': ['error', 'never'],
    'no-console': 'off',
    'no-mixed-operators': 'off',
    'no-param-reassign': ['error', { props: false }],
    semi: ['error', 'never']
  }
}
