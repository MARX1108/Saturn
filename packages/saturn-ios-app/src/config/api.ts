// src/config/api.ts

// API Configuration Settings

// Base URL and settings
export const API_BASE_URL = __DEV__
  ? 'http://localhost:4000/api' // Development
  : 'https://api.example.com/api'; // Production - replace with your actual production API URL

// API timeout in milliseconds
export const API_TIMEOUT = 10000; // 10 seconds

// API Endpoints
export const ApiEndpoints = {
  // Auth endpoints
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',

  // Actors endpoints
  actors: '/actors',

  // Posts endpoints
  posts: '/posts',

  // Other endpoints can be added as needed
} as const; // Make this const to ensure it's not modified
