module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@dentalos/shared-domain$': '<rootDir>/../../packages/shared-domain/src',
    '^@dentalos/shared-errors$': '<rootDir>/../../packages/shared-errors/src',
    '^@dentalos/shared-validation$': '<rootDir>/../../packages/shared-validation/src',
    '^@dentalos/shared-auth$': '<rootDir>/../../packages/shared-auth/src',
    '^@dentalos/shared-types$': '<rootDir>/../../packages/shared-types/src',
    '^@dentalos/shared-events$': '<rootDir>/../../packages/shared-events/src',
  },
};
