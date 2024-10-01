module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],
  rules: {
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {ignoreRestSiblings: true}],
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    'no-only-tests/no-only-tests': 'error',
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
  },
  plugins: ['no-only-tests'],
};
