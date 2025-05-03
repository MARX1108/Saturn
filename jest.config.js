// jest.config.js
module.exports = {
  preset: 'react-native',
  testTimeout: 30000, // Increase timeout for Pact tests (e.g., 30 seconds)
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // You might add a specific testMatch pattern for contract tests later
  // testMatch: ['**/*.contract.test.ts'],
};
