import { Storage } from "redux-persist";
import { Platform } from "react-native";

// Platform-specific storage implementation
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

  // Mock storage object for web compatibility
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
  // Native implementation using MMKV
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
}

export { reduxStorage };
export default storage;