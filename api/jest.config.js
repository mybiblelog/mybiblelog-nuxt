module.exports = {
  testMatch: ['**/test/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    '**/*.ts',
    '**/*.js',
    '!**/test/**',
    '!**/dist/**',
    '!**/node_modules/**',
  ],
};

