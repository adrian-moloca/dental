module.exports = {
  ...require('./jest.config'),
  testMatch: ['**/test/integration/**/*.spec.ts'],
  testTimeout: 30000,
};
