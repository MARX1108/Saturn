import { Storage } from "redux-persist";

// Web-compatible storage using localStorage
export const reduxStorage: Storage = {
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
const storage = {
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

export default storage;