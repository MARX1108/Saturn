/**
 * Placeholder function to get the auth token.
 * Replace with actual implementation using AsyncStorage or SecureStore later.
 */
export const getToken = async (): Promise<string | null> => {
  console.warn('[TokenStorage] getToken: Placeholder implementation!');
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 50));
  // Return null for now, or a hardcoded token for testing if needed
  return null;
  // Example: return await AsyncStorage.getItem('authToken');
};

/**
 * Placeholder function to set the auth token.
 * Replace with actual implementation using AsyncStorage or SecureStore later.
 */
export const setToken = async (_token: string): Promise<void> => {
  console.warn('[TokenStorage] setToken: Placeholder implementation!');
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 50));
  // Example: await AsyncStorage.setItem('authToken', token);
};

/**
 * Placeholder function to remove the auth token.
 * Replace with actual implementation using AsyncStorage or SecureStore later.
 */
export const removeToken = async (): Promise<void> => {
  console.warn('[TokenStorage] removeToken: Placeholder implementation!');
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 50));
  // Example: await AsyncStorage.removeItem('authToken');
};

// In-memory storage for development (replace with actual storage in production)
let authToken: string | null = null;

/**
 * Store authentication token
 * @param token JWT token from server
 */
export const setToken = async (token: string): Promise<void> => {
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
  // In a real app, retrieve from secure storage:
  // return await SecureStore.getItemAsync('auth_token');
  return authToken;
};

/**
 * Clear the stored authentication token (for logout)
 */
export const clearToken = async (): Promise<void> => {
  authToken = null;
  console.warn('[TokenStorage] clearToken: Using in-memory storage only');
  // In a real app, remove from secure storage:
  // await SecureStore.deleteItemAsync('auth_token');
};
