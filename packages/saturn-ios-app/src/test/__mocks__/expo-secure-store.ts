/**
 * Mock implementation of expo-secure-store for testing
 */

// In-memory storage for testing
const mockStorage: Record<string, string> = {};

// Since this is a mock, we don't need actual await operations
/* eslint-disable @typescript-eslint/require-await */

export const setItemAsync = async (
  key: string,
  value: string
): Promise<void> => {
  mockStorage[key] = value;
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  return mockStorage[key] || null;
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  delete mockStorage[key];
};

/* eslint-enable @typescript-eslint/require-await */

// Default export
export default {
  setItemAsync,
  getItemAsync,
  deleteItemAsync,
};
