import "@testing-library/jest-dom";

// Set up global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Fix global ENV reference
global.ENV = {
  VITE_API_URL: "http://localhost:4000/api",
} as any;

// Import window.ENV fix
window.ENV = {
  VITE_API_URL: "http://localhost:4000/api",
};

// Enable fake timers
jest.useFakeTimers();

// Mock URL.createObjectURL if needed
if (typeof global.URL.createObjectURL === "undefined") {
  global.URL.createObjectURL = jest.fn();
}

// Add global mocks here if needed
