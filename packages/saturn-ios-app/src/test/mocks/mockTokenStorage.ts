// src/test/mocks/mockTokenStorage.ts

// In-memory storage for testing
let authToken: string | null = null;

/**
 * Mock function to get auth token
 */
export const getToken = async (): Promise<string | null> => {
  return authToken;
};

/**
 * Mock function to set auth token
 */
export const setToken = async (token: string): Promise<void> => {
  authToken = token;
};

/**
 * Mock function to clear auth token
 */
export const clearToken = async (): Promise<void> => {
  authToken = null;
};
