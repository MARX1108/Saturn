import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: '@fyp-saturn/auth-token',
};

/**
 * Service to manage authentication tokens using AsyncStorage
 */
export const tokenService = {
  /**
   * Save authentication token to AsyncStorage
   * @param token JWT or authentication token string
   */
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error saving auth token:', error);
      throw new Error('Failed to save authentication token');
    }
  },

  /**
   * Retrieve authentication token from AsyncStorage
   * @returns The stored token or null if not found
   */
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  },

  /**
   * Remove authentication token from AsyncStorage
   */
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing auth token:', error);
      throw new Error('Failed to remove authentication token');
    }
  },

  /**
   * Check if a valid token exists
   * @returns boolean indicating if token exists
   */
  hasToken: async (): Promise<boolean> => {
    const token = await tokenService.getToken();
    return token !== null && token !== '';
  },
};

export default tokenService;
