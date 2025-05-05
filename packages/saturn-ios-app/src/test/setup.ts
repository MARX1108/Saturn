// This file configures the testing environment for React Native tests

// Mock timers for React Native testing
import { jest } from '@jest/globals';

// Mock setTimeout, clearTimeout, and other timer functions
global.setTimeout = jest.fn((callback, timeout) => {
  return {} as NodeJS.Timeout;
}) as unknown as typeof global.setTimeout;

global.clearTimeout = jest.fn() as unknown as typeof global.clearTimeout;

global.setInterval = jest.fn(() => {
  return {} as NodeJS.Timeout;
}) as unknown as typeof global.setInterval;

global.clearInterval = jest.fn() as unknown as typeof global.clearInterval;

global.requestAnimationFrame = jest.fn((callback) => {
  return 0;
}) as unknown as typeof global.requestAnimationFrame;

global.cancelAnimationFrame =
  jest.fn() as unknown as typeof global.cancelAnimationFrame;

// Mock the URL environment since it's used by axios but not available in Jest tests
class MockURL {
  href: string;
  constructor(url: string) {
    this.href = url;
  }
}

// Create an interface that extends the global object to type the URL property
interface CustomGlobal {
  URL: typeof MockURL;
}

// Apply the mock to the global object with proper typing
(global as unknown as CustomGlobal).URL = MockURL;

// Silence React Native's YellowBox warnings in tests
jest.mock('react-native/Libraries/LogBox/LogBox', () => ({
  ignoreLogs: jest.fn(),
}));

// Setup complete
console.log('Jest test environment setup completed');
