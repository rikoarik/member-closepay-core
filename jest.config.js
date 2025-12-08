module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|iconsax-react-nativejs)',
  ],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/**/__tests__/**',
    '!packages/**/index.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/__tests__/**/*.test.{ts,tsx}',
    '**/*.test.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/packages/core/$1',
    '^@plugins/(.*)$': '<rootDir>/packages/plugins/$1',
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './test-results',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Test Results - Merchant Closepay V2',
        openReport: false,
        inlineSource: false,
        includeFailureMsg: true,
        includeSuiteFailure: true,
        logoImgPath: undefined,
        sort: 'status',
      },
    ],
  ],
};
