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
  protocol: string;
  host: string;
  hostname: string;
  pathname: string;
  search: string;
  hash: string;
  replace: (search: string, replace: string) => string;

  constructor(url: string, base?: string) {
    this.href = url;

    // Simple parsing for common URL formats used in tests
    // This is a very basic implementation to support axios URL operations
    if (url.startsWith('http')) {
      const urlParts = url.split('://');
      this.protocol = urlParts[0] + ':';

      const parts = urlParts[1].split('/');
      this.host = parts[0];
      this.hostname = parts[0];
      this.pathname = '/' + parts.slice(1).join('/');
    } else {
      // Handle relative URLs
      this.protocol = 'http:';
      this.host = 'localhost';
      this.hostname = 'localhost';
      this.pathname = url;
    }

    this.search = '';
    this.hash = '';
    this.replace = (search: string, replaceWith: string) => {
      return this.href.replace(search, replaceWith);
    };
  }

  toString() {
    return this.href;
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

// Make fetch available globally for axios to use as a fallback
global.fetch = jest.fn().mockImplementation((url) => {
  return Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true,
    status: 200,
    headers: new Map(),
  });
}) as unknown as typeof global.fetch;

// Setup Axios mocks
jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios');
  return {
    ...(originalModule as object),
    create: () => {
      return {
        ...(originalModule as object),
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn(), eject: jest.fn() },
          response: { use: jest.fn(), eject: jest.fn() },
        },
        defaults: {
          baseURL: 'http://localhost:4000',
        },
      };
    },
  };
});

// Setup complete
console.log('Jest test environment setup completed');
