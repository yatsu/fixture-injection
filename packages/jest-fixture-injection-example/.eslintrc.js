module.exports = {
  plugins: ['jest'],
  env: {
    'jest/globals': true
  },
  globals: {
    fixture: true,
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
    semi: ['error', 'never'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.js'] }],
    'import/no-unresolved': ['error', { commonjs: true }],
    'import/prefer-default-export': 'off',
    'node/no-missing-require': ['error', { allowModules: ['jest-fixture-injection'] }],
    'node/no-unpublished-require': ['error', { allowModules: ['jest-fixture-injection'] }]
  }
}
