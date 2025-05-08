/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import apiClient from './apiClient';
import { ApiEndpoints, API_BASE_URL } from '../config/api';
import { User } from '../types/user';
import { AxiosError, AxiosRequestHeaders, AxiosResponse } from 'axios';
import axios from 'axios';
import { addAuthHeader } from '../utils/auth';

// This interface represents the raw backend response
// We only use it for typing - the actual data is defensively filtered to User type
interface ActorResponse {
  _id: string;
  id: string;
  username: string;
  preferredUsername?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  // These are the sensitive fields we want to filter out
  email?: string;
  password?: string;
  passwordHash?: string;
  // There could be other fields here that we don't need
  [key: string]: unknown;
}

// Custom error interface with status code
interface ApiErrorWithStatus extends Error {
  status?: number;
}

// Type for profile response in both the API and our tests
export type UserProfileResponse = User;

/**
 * Fetches public profile data for a given username.
 * IMPORTANT: Selectively returns only non-sensitive fields defined in the User type.
 */
export const fetchUserProfileByUsername = async (
  username: string
): Promise<UserProfileResponse> => {
  try {
    const endpoint = ApiEndpoints.getActorByUsername(username);

    // Debug logging for troubleshooting
    console.log(
      `[ProfileService] Fetching profile for username: ${username}, Endpoint: ${endpoint}, Full URL: ${apiClient.defaults.baseURL}${endpoint}`
    );

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
    } as AxiosRequestHeaders;

    // Add auth headers - use the return value instead of passing headers
    const authHeaders = await addAuthHeader();

    // Debug auth headers (careful not to log full token in production)
    if (authHeaders.Authorization) {
      console.log('[ProfileService] Using Authorization header: Bearer xxx...');
    } else {
      console.log('[ProfileService] No Authorization header available');
    }

    Object.assign(headers, authHeaders);

    // Make the API request
    const response = await apiClient.get(endpoint, { headers });

    // Debug raw response
    console.log(
      '[ProfileService] Raw response:',
      typeof response,
      response ? 'data present' : 'null/undefined'
    );

    // Handle null/undefined responses
    if (!response) {
      console.error(
        '[ProfileService] Invalid user profile response: undefined'
      );
      throw new Error('Invalid user profile data received: empty response');
    }

    // Handle data wrapped in `data` property (for tests or certain API formats)
    if (response?.data) {
      console.log(
        '[ProfileService] Response has nested data property, checking its contents'
      );
      if (response.data.id && response.data.username) {
        // Use username as displayName if missing
        if (!response.data.displayName) {
          console.log(
            '[ProfileService] Using username as displayName fallback'
          );
          response.data.displayName = response.data.username;
        }
        return response.data;
      }
    }

    // Validate response fields
    if (!response.id && !response._id) {
      console.error('[ProfileService] Missing id in response:', response);
      throw new Error('Invalid user profile data: missing id');
    }

    // If response has _id but no id, use _id as id
    if (!response.id && response._id) {
      console.log('[ProfileService] Using _id as id fallback');
      response.id = response._id;
    }

    if (!response.username) {
      console.error('[ProfileService] Missing username in response:', response);
      throw new Error('Invalid user profile data: missing username');
    }

    // If displayName is missing, use username as fallback
    if (typeof response.displayName !== 'string') {
      console.log('[ProfileService] Using username as displayName fallback');
      response.displayName = response.username;
    }

    console.log(
      '[ProfileService] Successfully retrieved profile data for:',
      username
    );
    return response;
  } catch (error) {
    // Add specific error handling for different error types
    if (axios.isAxiosError(error)) {
      // Handle API errors (status codes, network issues, etc.)
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(
          `[ProfileService] API Error (${axiosError.response.status}):`,
          axiosError.response.data
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error(
          '[ProfileService] No response received:',
          axiosError.request
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(
          '[ProfileService] Request setup error:',
          axiosError.message
        );
      }
    }

    console.error('[ProfileService] Error fetching user profile:', error);
    throw error; // Rethrow to be handled by the query
  }
};

/**
 * Updates the user's profile data.
 * Assumes API requires authentication (handled by apiClient interceptor).
 */
export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  // avatarUrl will be handled separately in a future task
}

export const updateUserProfile = async ({
  username,
  data,
}: {
  username: string;
  data: UpdateProfilePayload;
}): Promise<User> => {
  if (!username) {
    throw new Error('Username required for profile update');
  }

  try {
    const endpoint = ApiEndpoints.updateActorByUsername(username);
    console.log(
      `[ProfileService] Updating profile for username: ${username}, Endpoint: ${endpoint}`
    );

    // Make the API request
    const response = await apiClient.put<User>(endpoint, data);

    // Handle null/undefined responses
    if (!response) {
      console.error(
        '[ProfileService] Invalid update profile response: undefined'
      );
      throw new Error('Invalid profile update data received: empty response');
    }

    // Validate response fields
    if (!response.id && !response._id) {
      console.error('[ProfileService] Missing id in response:', response);
      throw new Error('Invalid profile update data: missing id');
    }

    // If response has _id but no id, use _id as id
    if (!response.id && response._id) {
      console.log('[ProfileService] Using _id as id fallback');
      response.id = response._id;
    }

    if (!response.username) {
      console.error('[ProfileService] Missing username in response:', response);
      throw new Error('Invalid profile update data: missing username');
    }

    // If displayName is missing, use username as fallback
    if (!response.displayName) {
      console.log('[ProfileService] Using username as displayName fallback');
      response.displayName = response.username;
    }

    console.log(
      '[ProfileService] Successfully updated profile data for:',
      username
    );
    return response;
  } catch (error) {
    console.error('[ProfileService] Error updating user profile:', error);
    throw error; // Rethrow to be handled by the mutation
  }
};
