module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true, // Useful to force Jest to exit after all tests complete
  clearMocks: true,
};
