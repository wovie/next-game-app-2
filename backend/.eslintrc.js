module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'eslint:recommended'],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'linebreak-style': 'off',
    'no-console': 'off',
    camelcase: 'off',
    radix: 'off',
    'object-curly-newline': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-promise-executor-return': 'off',
    'no-underscore-dangle': 'off',
    'no-continue': 'off',
  },
};
