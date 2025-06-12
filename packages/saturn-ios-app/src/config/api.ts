// src/config/api.ts
import { Platform } from 'react-native';
import { API_BASE_URL as ENV_API_BASE_URL } from '@env';

// API Configuration Settings

// Environment variable or fallback IP address
const MACHINE_IP = '10.137.37.62';

// Helper function for development environments
const getDevBaseUrl = () => {
  if (Platform.OS === 'ios') {
    // For iOS simulator, use the machine's actual IP address
    return `http://${MACHINE_IP}:4000`;
  } else if (Platform.OS === 'android') {
    // Special IP for Android emulator to access host machine
    return 'http://10.0.2.2:4000';
  }
  // Fallback
  return 'http://localhost:4000';
};

// Base URL configuration with environment variable support
const getBaseUrl = () => {
  // Check for environment variable from .env file
  if (ENV_API_BASE_URL) {
    return ENV_API_BASE_URL;
  }
  
  // Development vs production fallback
  return __DEV__ ? getDevBaseUrl() : 'https://api.example.com';
};

// Base URL and settings
export const API_BASE_URL = getBaseUrl();

// API timeout in milliseconds
export const API_TIMEOUT = 10000; // 10 seconds

// API Endpoints
export const ApiEndpoints = {
  // Auth endpoints
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',

  // Actors endpoints
  actors: '/api/actors',
  getActorByUsername: (username: string) => `/api/actors/${username}`,
  searchActors: '/api/actors/search',
  updateActor: (id: string) => `/api/actors/${id}`,
  updateActorByUsername: (username: string) =>
    `/api/actors/username/${username}`,

  // Posts endpoints
  posts: '/api/posts',

  // Other endpoints can be added as needed
} as const; // Make this const to ensure it's not modified
