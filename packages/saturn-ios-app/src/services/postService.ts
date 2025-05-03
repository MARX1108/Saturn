import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { Post } from '../types/post';

// Define the response structure
interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
}

// Define the expected request body structure
interface CreatePostBody {
  content: string;
  // Add other fields like visibility if needed by API
  // visibility?: 'public' | 'unlisted' | 'private';
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

/**
 * Creates a new post.
 * Assumes API requires authentication (handled by apiClient interceptor).
 */
export const createPost = async (postData: CreatePostBody): Promise<Post> => {
  try {
    if (!postData || typeof postData !== 'object') {
      throw new Error('Invalid post data: Post data must be an object');
    }

    if (!postData.content || typeof postData.content !== 'string') {
      throw new Error(
        'Invalid post data: Content is required and must be a string'
      );
    }

    // Send the post data to the API
    // The apiClient response interceptor already extracts the data
    const response = await apiClient.post<Post, Post>(
      ApiEndpoints.posts,
      postData
    );

    // More thorough validation of the response structure
    if (!response) {
      throw new Error('No response received from the server');
    }

    if (typeof response !== 'object') {
      throw new Error(`Invalid response type: ${typeof response}`);
    }

    // Check for the presence of required fields in the response
    if (!response._id) {
      console.error('Response missing _id field:', response);
      throw new Error('Invalid post object returned from server');
    }

    return response;
  } catch (error) {
    console.error('Error creating post:', error);
    // Rethrow but ensure it's a proper Error object with message
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(
        typeof error === 'string' ? error : 'Unknown error creating post'
      );
    }
  }
};

// Add other post-related service functions later (likePost, unlikePost, etc.)
