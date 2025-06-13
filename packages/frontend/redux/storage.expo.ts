import { Storage } from "redux-persist";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Expo Go compatible storage using AsyncStorage
export const reduxStorage: Storage = {
  setItem: (key, value) => {
    return AsyncStorage.setItem(key, value);
  },
  getItem: (key) => {
    return AsyncStorage.getItem(key);
  },
  removeItem: (key) => {
    return AsyncStorage.removeItem(key);
  },
};

// Mock storage object for compatibility
const storage = {
  getString: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  set: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  delete: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};

export default storage;