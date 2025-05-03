// src/config/api.ts
export const API_BASE_URL = 'http://localhost:4000/api'; // Note: Added /api path

export const ApiEndpoints = {
  // Auth
  register: '/auth/register',
  login: '/auth/login',
  me: '/auth/me',
  // Actors
  searchActors: '/actors/search',
  getActorByUsername: (username: string) => `/actors/${username}`,
  // Posts
  createPost: '/posts',
  getPosts: '/posts',
  getPostById: (postId: string) => `/posts/${postId}`,
  likePost: (postId: string) => `/posts/${postId}/like`,
  unlikePost: (postId: string) => `/posts/${postId}/unlike`,
  // Add other endpoints as needed
};

// Add other API related constants if necessary
export const API_TIMEOUT = 15000; // 15 seconds
