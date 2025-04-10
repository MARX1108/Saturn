import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/user';
import { AppSettings, defaultSettings } from '../types/settings';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: '@FlourishApp:userProfile',
  AUTH_TOKEN: '@FlourishApp:authToken',
  APP_SETTINGS: '@FlourishApp:appSettings',
};

/**
 * Storage Service
 * Provides utility functions to work with AsyncStorage
 */

// User Profile Functions
export const saveUserProfile = async (user: User): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, jsonValue);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw new Error('Failed to save user profile');
  }
};

export const loadUserProfile = async (): Promise<User | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return jsonValue ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

export const removeUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  } catch (error) {
    console.error('Error removing user profile:', error);
    throw new Error('Failed to remove user profile');
  }
};

// Authentication Token Functions
export const saveAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
    throw new Error('Failed to save authentication token');
  }
};

export const loadAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error loading auth token:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
    throw new Error('Failed to remove authentication token');
  }
};

// App Settings Functions
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, jsonValue);
  } catch (error) {
    console.error('Error saving app settings:', error);
    throw new Error('Failed to save app settings');
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return jsonValue ? JSON.parse(jsonValue) : defaultSettings;
  } catch (error) {
    console.error('Error loading app settings:', error);
    return defaultSettings;
  }
};

// Logout - Clear all user data
export const clearUserData = async (): Promise<void> => {
  try {
    const keys = [STORAGE_KEYS.USER_PROFILE, STORAGE_KEYS.AUTH_TOKEN];
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw new Error('Failed to clear user data');
  }
};
