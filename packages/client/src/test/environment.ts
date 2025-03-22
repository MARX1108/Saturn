// Environment setup for tests
global.ENV = {
  VITE_API_URL: "http://localhost:4000/api",
};

window.ENV = {
  VITE_API_URL: "http://localhost:4000/api",
};

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

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
