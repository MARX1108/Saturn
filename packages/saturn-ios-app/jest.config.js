// jest.config.js
module.exports = {
  preset: 'react-native',
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  setupFiles: ['<rootDir>/src/test/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-.*|@react-navigation/.*|@pact-foundation/.*|expo-.*|@expo/.*)/)',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    'expo-secure-store': '<rootDir>/src/test/__mocks__/expo-secure-store.ts',
    '@pact-foundation/pact':
      '<rootDir>/src/test/__mocks__/@pact-foundation/pact.ts',
  },
  // You might add a specific testMatch pattern for contract tests later
  // testMatch: ['**/*.contract.test.ts'],
  globals: {
    __DEV__: true,
  },
  // Clear mocks between tests
  clearMocks: true,
  // Automatically restore mocks between tests
  restoreMocks: true,
  // Use resetMocks to help ensure tests clean up after themselves
  resetMocks: false,
};
