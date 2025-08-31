// e2e/jest.config.js
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/__tests__/e2e/**/*.e2e.test.(js|ts)'],
  testTimeout: 120000,
  maxWorkers: 1,
  globalSetup: 'detox/runners/jest/globalSetup',
  globalTeardown: 'detox/runners/jest/globalTeardown',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'e2e/reports',
        outputName: 'junit.xml',
      },
    ],
  ],
  testEnvironment: 'detox/runners/jest/testEnvironment',
  verbose: true,
};
