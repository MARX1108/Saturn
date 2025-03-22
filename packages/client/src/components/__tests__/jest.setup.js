// This is a global setup file for Jest

// Enable fake timers globally
jest.useFakeTimers();

// Mock fetch if it doesn't exist in the test environment
if (typeof global.fetch !== "function") {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
}

// Initialize missing globals that might be needed for tests
if (typeof global.URL.createObjectURL === "undefined") {
  global.URL.createObjectURL = jest.fn();
}

// Mock LocalStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
