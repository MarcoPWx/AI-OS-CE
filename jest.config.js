// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/setup.ts',
    '@testing-library/jest-native/extend-expect',
  ],
  testMatch: ['**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)', '!**/__tests__/e2e/**/*'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/data/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50, // Lowered for initial setup
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/components/': {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    '^@\/(.*)$': '<rootDir>/src/$1',
    '^vitest$': '<rootDir>/test/shims/vitest.ts',
    '^msw/node$': '<rootDir>/node_modules/msw/lib/node/index.js',
    '^msw$': '<rootDir>/node_modules/msw/lib/core/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation|expo-.*|@expo|lottie-react-native|@supabase|@revenuecat|expo|msw)/)',
  ],
  // Remove testEnvironment to let jest-expo handle it

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/__tests__/e2e/'],
};
