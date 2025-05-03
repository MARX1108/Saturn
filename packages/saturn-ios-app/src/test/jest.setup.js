// jest.setup.js
// Mock react-native modules that might not be available in the test environment
jest.mock('react-native', () => {
  return {
    // Add any RN components or APIs that are used in your tests
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    NativeModules: {},
    // Add other mocks as needed
  };
});

// Mock tokenStorage to prevent circular dependencies
jest.mock('../services/tokenStorage', () => {
  return {
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn().mockResolvedValue(undefined),
    clearToken: jest.fn().mockResolvedValue(undefined),
  };
});

// Set up any global test configurations
global.console = {
  ...global.console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};

// Silence specific expected warnings
jest.spyOn(console, 'warn').mockImplementation((...args) => {
  if (args[0]?.includes('Some expected warning')) {
    return;
  }
  console.warn(...args);
});
