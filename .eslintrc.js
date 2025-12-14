module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  // Shared custom rules for all JavaScript files
  rules: {
    indent: [
      'error',
      2,
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    semi: [
      'error',
      'always',
    ],
    'dot-notation': [
      'error',
    ],
    eqeqeq: [
      'error',
      'always',
    ],
    'no-magic-numbers': [
      'off',
    ],
    'eol-last': [
      'error',
      'always',
    ],
    'no-trailing-spaces': [
      'error',
    ],
    'object-property-newline': [
      'error',
      {
        allowMultiplePropertiesPerLine: true,
      },
    ],
    'operator-linebreak': [
      'error',
      'after',
    ],
    'block-spacing': [
      'error',
    ],
    'brace-style': [
      'error',
      'stroustrup',
      { allowSingleLine: true },
    ],
    'comma-dangle': [
      'error',
      'always-multiline',
    ],
    'space-before-blocks': [
      'error',
      'always',
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'space-infix-ops': [
      'error',
    ],
    'space-unary-ops': [
      'error',
      {
        words: true,
        nonwords: false,
      },
    ],
    'keyword-spacing': [
      'error',
    ],
    'no-console': [
      'warn',
    ],
    'no-var': [
      'warn',
    ],
    'no-unused-vars': [
      'warn',
    ],
    strict: [
      'warn',
      'global',
    ],
  },
};
