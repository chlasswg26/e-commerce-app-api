module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'multiline-ternary': ['error', 'never']
  }
}
