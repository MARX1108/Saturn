import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { Post } from '../types/post';

// Define the response structure
interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
}

/**
 * Fetches the main feed posts.
 * Assumes the API requires authentication (handled by apiClient interceptor).
 */
export const fetchFeedPosts = async (): Promise<Post[]> => {
  try {
    // Get the posts from the API
    // The apiClient response interceptor already extracts the data
    const response = await apiClient.get<FeedResponse, FeedResponse>(
      ApiEndpoints.posts
    );

    // Validate the response structure
    if (
      !response ||
      typeof response !== 'object' ||
      !Array.isArray(response.posts)
    ) {
      console.error('Invalid feed response structure:', response);
      throw new Error('Invalid data received for feed posts.');
    }

    // Return just the posts array
    return response.posts;
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    throw error; // Rethrow to be handled by the query
  }
};

// Add other post-related service functions later (likePost, unlikePost, etc.)
