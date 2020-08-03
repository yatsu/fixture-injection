module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-require-type-checking',
    'plugin:prettier/recommended',
    'prettier/@typescript-eslint',
    'prettier/standard'
  ]
  plugins: [
    '@typescript-eslint'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module'
  },
  env: {
    node: true,
    jest: true,
    es2017: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  rules: {
    'no-extra-semi': 'error',
    quotes: ['error', 'single']
  },
  ignorePatterns: [
    '**/node_modules',
    '**/.*',
    '*.config.js',
  ]
}
