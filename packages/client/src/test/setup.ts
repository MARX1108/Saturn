import "@testing-library/jest-dom";

// Set up global environment variables for tests
global.ENV = {
  VITE_API_URL: "http://localhost:4000",
};

// Make the mock ENV available on window too
window.ENV = global.ENV;

// Enable mock fetch if needed
if (typeof global.fetch !== "function") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;
}

// Enable fake timers
jest.useFakeTimers();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();
