// src/config/api.ts

// API Configuration Settings

// Base URL and settings
export const API_BASE_URL = __DEV__
  ? 'http://localhost:4000' // Development - removed /api prefix
  : 'https://api.example.com'; // Production - removed /api prefix

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

  // Posts endpoints
  posts: '/api/posts',

  // Other endpoints can be added as needed
} as const; // Make this const to ensure it's not modified
