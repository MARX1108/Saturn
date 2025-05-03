/**
 * src/services/tokenStorage.ts
 * Token storage service for authentication.
 */

// In-memory storage for development (replace with actual storage in production)
let authToken: string | null = null;

/**
 * Store authentication token
 * @param token JWT token from server
 */
export const setToken = async (token: string): Promise<void> => {
  // Simulate async operation for future AsyncStorage compatibility
  await Promise.resolve();
  authToken = token;
  console.warn('[TokenStorage] setToken: Using in-memory storage only');
  // In a real app, store in secure storage:
  // await SecureStore.setItemAsync('auth_token', token);
};

/**
 * Get the stored authentication token
 * @returns The stored JWT token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  // Simulate async operation for future AsyncStorage compatibility
  await Promise.resolve();
  // In a real app, retrieve from secure storage:
  // return await SecureStore.getItemAsync('auth_token');
  return authToken;
};

/**
 * Clear the stored authentication token (for logout)
 */
export const clearToken = async (): Promise<void> => {
  // Simulate async operation for future AsyncStorage compatibility
  await Promise.resolve();
  authToken = null;
  console.warn('[TokenStorage] clearToken: Using in-memory storage only');
  // In a real app, remove from secure storage:
  // await SecureStore.deleteItemAsync('auth_token');
};
