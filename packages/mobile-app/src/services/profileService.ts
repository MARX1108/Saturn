import appConfig from '../config/appConfig';
import apiService from './apiService';
import { User } from '../types/user';
import { Post } from '../types/post';

/**
 * Profile Service
 * Handles API requests related to user profiles
 */
const profileService = {
  /**
   * Search for users by query string
   * @param query - The search query string
   * @returns Promise with an array of matching users
   */
  searchActors: async (query: string): Promise<User[]> => {
    try {
      return await apiService.get<User[]>(
        appConfig.endpoints.actors.searchActors,
        {
          params: { q: query },
        }
      );
    } catch (error) {
      console.error('Error searching for users:', error);
      throw error;
    }
  },

  /**
   * Fetch a user's profile by username
   * @param username - The username of the profile to fetch
   * @returns Promise with the user profile data
   */
  fetchUserProfile: async (username: string): Promise<User> => {
    try {
      const url = appConfig.endpoints.actors.getUserProfile.replace(
        ':username',
        username
      );
      return await apiService.get<User>(url);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Fetch posts authored by a specific user
   * @param username - The username of the user whose posts to fetch
   * @param page - Optional page number for pagination
   * @param limit - Optional limit of posts per page
   * @returns Promise with posts data including pagination info
   */
  fetchUserPosts: async (
    username: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ posts: Post[]; hasMore: boolean; totalCount?: number }> => {
    try {
      const url = appConfig.endpoints.posts.getUserPosts.replace(
        ':username',
        username
      );

      const response = await apiService.get<{
        posts: Post[];
        hasMore: boolean;
        totalCount?: number;
      }>(url, {
        params: { page, limit },
      });

      return {
        posts: response.posts || [],
        hasMore: response.hasMore || false,
        totalCount: response.totalCount,
      };
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  /**
   * Update a user's profile
   * @param username - The username of the profile to update
   * @param profileData - The updated profile data
   * @returns Promise with the updated user profile
   */
  updateUserProfile: async (
    username: string,
    profileData: {
      displayName?: string;
      bio?: string;
      avatarFile?: File;
    }
  ): Promise<User> => {
    try {
      const url = appConfig.endpoints.actors.updateActor.replace(
        ':username',
        username
      );

      // Create FormData to match API expectations
      const formData = new FormData();

      if (profileData.displayName) {
        formData.append('displayName', profileData.displayName);
      }

      if (profileData.bio) {
        formData.append('bio', profileData.bio);
      }

      if (profileData.avatarFile) {
        formData.append('avatarFile', profileData.avatarFile);
      }

      // Use multipart/form-data as required by API documentation
      return await apiService.putForm<User>(url, formData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};

export default profileService;
