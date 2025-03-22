// Environment setup for tests
const API_URL = "http://localhost:4000";

// Export all environment variables that might be used in tests
const env = {
  VITE_API_URL: API_URL,
  VITE_API_BASE_URL: API_URL,
  // Add any other environment variables used in your app
};

// Set up global ENV object for tests
global.ENV = env;
window.ENV = env;

// For direct property access like import.meta.env.VITE_API_URL
Object.entries(env).forEach(([key, value]) => {
  Object.defineProperty(global.ENV, key, {
    value,
    enumerable: true,
  });
});

// For Jest tests - export mock env object
export default env;
export const VITE_API_URL = API_URL;
export const VITE_API_BASE_URL = API_URL;

// Mock fetch API if needed
if (typeof global.fetch !== "function") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
}

// Common mocks for tests
jest.mock("../services/aiClient", () => ({
  default: {
    loadModel: jest.fn().mockResolvedValue(true),
    generateResponse: jest.fn().mockResolvedValue("Mock response"),
    analyzeContent: jest.fn().mockResolvedValue({
      sentiment: "positive",
      topics: ["test"],
    }),
  },
}));
