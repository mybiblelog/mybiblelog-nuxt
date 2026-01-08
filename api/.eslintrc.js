module.exports = {
  root: true,
  env: {
    node: true,
  },
  ignorePatterns: [
    'dist/**',
    'node_modules/**',
  ],
  extends: [
    '../.eslintrc.js',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  // TypeScript specific rules
  rules: {
    // TypeScript handles unused vars, so disable the base rule
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    // Allow explicit any for flexibility in API code
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
