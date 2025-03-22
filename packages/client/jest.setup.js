// This file is referenced in jest.config.js

// Set up global environment variables for tests
global.ENV = {
  VITE_API_URL: "http://localhost:4000",
};

// Make the mock ENV available on window too
window.ENV = global.ENV;

// We can't use import.meta.env directly in Jest tests
// Instead, use global.ENV for the same purpose

// Additional setup for Jest
jest.setTimeout(10000); // 10 second timeout

// Mock implementation for window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Enable mock fetch if needed
if (typeof global.fetch !== "function") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
}

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Load component mocks
require("./src/test/mockSetup");
