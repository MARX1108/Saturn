/**
 * src/services/tokenStorage.ts
 * Token storage service for authentication using SecureStore.
 */
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authToken'; // Key for storing the token

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
