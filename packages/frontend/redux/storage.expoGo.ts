import { Storage } from "redux-persist";
import { Platform } from "react-native";

// Simple in-memory storage fallback for Expo Go
const memoryStorage = {
  data: {} as Record<string, string>,
  setItem: (key: string, value: string) => {
    memoryStorage.data[key] = value;
    return Promise.resolve();
  },
  getItem: (key: string) => {
    return Promise.resolve(memoryStorage.data[key] || null);
  },
  removeItem: (key: string) => {
    delete memoryStorage.data[key];
    return Promise.resolve();
  },
};

// Platform-specific storage implementation with Expo Go fallback
let storage: any;
let reduxStorage: Storage;

if (Platform.OS === 'web') {
  // Web-compatible storage using localStorage
  reduxStorage = {
    setItem: (key, value) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve(true);
    },
    getItem: (key) => {
      if (typeof window !== 'undefined') {
        const value = window.localStorage.getItem(key);
        return Promise.resolve(value);
      }
      return Promise.resolve(null);
    },
    removeItem: (key) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    },
  };

  storage = {
    getString: (key: string) => {
      if (typeof window !== 'undefined') {
        return window.localStorage.getItem(key);
      }
      return undefined;
    },
    set: (key: string, value: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    },
    delete: (key: string) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    },
  };
} else {
  // Native implementation - try MMKV first, fallback to memory storage
  try {
    const { MMKV } = require("react-native-mmkv");
    const mmkvStorage = new MMKV();

    reduxStorage = {
      setItem: (key, value) => {
        mmkvStorage.set(key, value);
        return Promise.resolve(true);
      },
      getItem: (key) => {
        const value = mmkvStorage.getString(key);
        return Promise.resolve(value);
      },
      removeItem: (key) => {
        mmkvStorage.delete(key);
        return Promise.resolve();
      },
    };

    storage = mmkvStorage;
    console.log('✅ Using MMKV storage');
  } catch (error) {
    console.log('⚠️ MMKV not available (Expo Go), using memory storage fallback');
    
    reduxStorage = memoryStorage;
    
    storage = {
      getString: (key: string) => {
        const value = memoryStorage.data[key];
        return value || undefined;
      },
      set: (key: string, value: string) => {
        memoryStorage.data[key] = value;
      },
      delete: (key: string) => {
        delete memoryStorage.data[key];
      },
    };
  }
}

export { reduxStorage };
export default storage;