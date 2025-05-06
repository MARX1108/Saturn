/**
 * Mock implementation of the tokenStorage service for testing purposes.
 * This avoids the need for expo-secure-store in tests.
 */

// In-memory token store for tests
let mockToken: string | null = null;

/**
 * Sets the authentication token
 */
export const setToken = (token: string): Promise<void> => {
  mockToken = token;
  return Promise.resolve();
};

/**
 * Gets the current authentication token
 */
export const getToken = (): Promise<string | null> => {
  return Promise.resolve(mockToken);
};

/**
 * Removes the authentication token
 */
export const removeToken = (): Promise<void> => {
  mockToken = null;
  return Promise.resolve();
};

// Default export for compatibility
export default {
  setToken,
  getToken,
  removeToken,
};
