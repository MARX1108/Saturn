// jest.config.js
module.exports = {
  preset: 'react-native',
  testTimeout: 30000,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo-|@expo|@sentry|@pact-foundation)/)',
  ],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/jest.setup.js'],
};
