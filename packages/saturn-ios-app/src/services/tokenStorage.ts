/**
 * src/services/tokenStorage.ts
 * Token storage service for authentication using SecureStore.
 */
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authToken'; // Key for storing the token
const CREDENTIALS_KEY = 'authCredentials'; // Key for storing credentials

// Interface for login credentials
export interface StoredCredentials {
  username: string;
  password: string;
}

/**
 * Gets the auth token from secure storage.
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error getting token:', error);
    return null;
  }
};

/**
 * Sets the auth token in secure storage.
 */
export const setToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('[TokenStorage] Error setting token:', error);
  }
};

/**
 * Removes the auth token from secure storage.
 */
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('[TokenStorage] Error removing token:', error);
  }
};

/**
 * Stores login credentials for token refresh.
 * IMPORTANT: Only store credentials if the user has explicitly agreed to save them.
 */
export const storeCredentials = async (
  credentials: StoredCredentials
): Promise<void> => {
  try {
    // Securely store credentials as JSON string
    await SecureStore.setItemAsync(
      CREDENTIALS_KEY,
      JSON.stringify(credentials)
    );
    console.log('[TokenStorage] Credentials stored securely');
  } catch (error) {
    console.error('[TokenStorage] Error storing credentials:', error);
  }
};

/**
 * Retrieves the stored credentials for token refresh.
 */
export const getStoredCredentials =
  async (): Promise<StoredCredentials | null> => {
    try {
      const credentialsJson = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      if (!credentialsJson) return null;

      return JSON.parse(credentialsJson) as StoredCredentials;
    } catch (error) {
      console.error('[TokenStorage] Error retrieving credentials:', error);
      return null;
    }
  };

/**
 * Removes stored credentials.
 */
export const removeCredentials = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    console.log('[TokenStorage] Credentials removed');
  } catch (error) {
    console.error('[TokenStorage] Error removing credentials:', error);
  }
};

/**
 * Clears all authentication data (both token and credentials).
 * Use this for full logout.
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([removeToken(), removeCredentials()]);
    console.log('[TokenStorage] All auth data cleared');
  } catch (error) {
    console.error('[TokenStorage] Error clearing auth data:', error);
  }
};
