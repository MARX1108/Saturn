// Mock implementation of SecureStore for tests
const mockStore: Record<string, string> = {};

// Since this is a mock, we don't need actual await operations
/* eslint-disable @typescript-eslint/require-await */

export async function getItemAsync(key: string): Promise<string | null> {
  return mockStore[key] || null;
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  mockStore[key] = value;
  return Promise.resolve();
}

export async function deleteItemAsync(key: string): Promise<void> {
  delete mockStore[key];
  return Promise.resolve();
}

/* eslint-enable @typescript-eslint/require-await */

// Add any other SecureStore methods that you need to mock
export default {
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
};
