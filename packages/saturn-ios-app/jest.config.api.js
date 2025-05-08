// jest.config.api.js - Specialized for API and contract tests only
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
    // Mock problematic RN dependencies
    'react-native-toast-message':
      '<rootDir>/src/test/__mocks__/react-native-toast-message.ts',
    'styled-components/native':
      '<rootDir>/src/test/__mocks__/styled-components-native.ts',
    'react-native-vector-icons/.*':
      '<rootDir>/src/test/__mocks__/react-native-vector-icons.ts',
  },
  // Only run contract tests and hook tests
  testMatch: [
    '**/*.contract.test.ts',
    '**/hooks/use*.test.[jt]sx',
    '**/services/*.test.[jt]s',
    '**/test/dummy.test.ts',
  ],
  // Skip tests that require UI rendering
  testPathIgnorePatterns: [
    'node_modules',
    'screens/.*\\.test\\.[jt]sx?$',
    'components/.*\\.test\\.[jt]sx?$',
  ],
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
