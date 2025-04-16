import apiService from './apiService';
import { Post } from '../types/post';
import appConfig from '../config/appConfig';
import { ImagePickerAsset } from 'expo-image-picker';
import { ApiError } from '../types/api';

/**
 * Post Service
 * Handles interactions with post-related API endpoints
 */
export const postService = {
  /**
   * Fetch feed posts from the workspace
   * @param page - Optional page number for pagination
   * @param limit - Optional number of posts per page
   * @returns Promise with the feed posts
   */
  fetchFeedPosts: async (page = 1, limit = 20): Promise<Post[]> => {
    try {
      const params = { page, limit };
      const url = appConfig.endpoints.posts.feed;

      const response = await apiService.get<{
        posts: Post[];
        hasMore: boolean;
      }>(url, { params });

      return response.posts;
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        throw new Error('Please log in to view posts');
      }

      if (apiError.status === 404) {
        throw new Error('Feed not available. Please try again later.');
      }

      console.error('Error fetching feed posts:', error);
      throw new Error('Failed to load posts. Please try again.');
    }
  },

  /**
   * Fetch a single post by ID
   * @param postId - ID of the post to fetch
   * @returns Promise with the post data
   */
  getPostById: async (postId: string): Promise<Post> => {
    try {
      const url = appConfig.endpoints.posts.getPost.replace(':id', postId);
      return await apiService.get<Post>(url);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.status === 401) {
        throw new Error('Please log in to view this post');
      }

      if (apiError.status === 404) {
        throw new Error('Post not found');
      }

      console.error(`Error fetching post ${postId}:`, error);
      throw new Error('Failed to load post. Please try again.');
    }
  },

  /**
   * Like a post
   * @param postId - ID of the post to like
   * @returns Promise with the updated post
   */
  likePost: async (postId: string): Promise<Post> => {
    try {
      const url = appConfig.endpoints.posts.likePost.replace(':id', postId);
      return await apiService.post<Post>(url);
    } catch (error) {
      console.error(`Error liking post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Unlike a post
   * @param postId - ID of the post to unlike
   * @returns Promise<void> - The unlike operation completes successfully
   */
  unlikePost: async (postId: string): Promise<void> => {
    try {
      const url = appConfig.endpoints.posts.likePost.replace(':id', postId);
      await apiService.delete(url);
    } catch (error) {
      console.error(`Error unliking post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new post
   * @param content - The text content of the post
   * @param mediaAsset - Optional image asset to upload with the post
   * @returns Promise with the newly created post
   */
  createPost: async (
    content: string,
    mediaAsset?: ImagePickerAsset | null
  ): Promise<Post> => {
    try {
      const url = appConfig.endpoints.posts.createPost;

      // Create FormData to match API expectations
      const formData = new FormData();
      formData.append('content', content);

      // Add media file if provided
      if (mediaAsset) {
        const fileObject = {
          uri: mediaAsset.uri,
          name: mediaAsset.fileName || 'photo.jpg',
          type: mediaAsset.mimeType || 'image/jpeg',
        };
        formData.append('mediaFile', fileObject as any);
      }

      // Use multipart/form-data as required by API documentation
      return await apiService.postForm<Post>(url, formData);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },
};

export default postService;
