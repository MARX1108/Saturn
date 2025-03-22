// This file is referenced in jest.config.js

// Set up global environment variables for tests
global.ENV = {
  VITE_API_URL: "http://localhost:4000",
};

// Make the mock ENV available on window too
window.ENV = global.ENV;

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

// Load component mocks - do this first to ensure all mocks are in place
try {
  // Require the mock setup files
  require("./src/test/mockSetup");
  require("./src/test/mocks/appMocks");
} catch (error) {
  console.error("Error loading mock files:", error);
}
