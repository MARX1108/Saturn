import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { Post } from '../types/post';

/**
 * Fetches the main feed posts.
 * Assumes the API requires authentication (handled by apiClient interceptor).
 */
export const fetchFeedPosts = async (): Promise<Post[]> => {
  try {
    // Get the posts from the API
    // The apiClient response interceptor already extracts the data
    const response = await apiClient.get<Post[]>(ApiEndpoints.posts);

    // Validate the response is an array
    if (!Array.isArray(response)) {
      console.error('Invalid feed response structure:', response);
      throw new Error('Invalid data received for feed posts.');
    }

    return response;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error; // Rethrow to be handled by the query
  }
};

// Add other post-related service functions later (likePost, unlikePost, etc.)
