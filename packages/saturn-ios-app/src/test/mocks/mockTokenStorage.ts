// src/test/mocks/mockTokenStorage.ts

// In-memory storage for testing
let authToken: string | null = null;

/**
 * Mock function to get auth token
 */
export const getToken = async (): Promise<string | null> => {
  // Simulate async operation
  await Promise.resolve();
  return authToken;
};

/**
 * Mock function to set auth token
 */
export const setToken = async (token: string): Promise<void> => {
  // Simulate async operation
  await Promise.resolve();
  authToken = token;
};

/**
 * Mock function to clear auth token
 */
export const clearToken = async (): Promise<void> => {
  // Simulate async operation
  await Promise.resolve();
  authToken = null;
};
