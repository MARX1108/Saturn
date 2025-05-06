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
    Object.assign(headers, authHeaders);

    // Make the API request
    const { data: response } = await apiClient.get(endpoint, { headers });

    // Handle data wrapped in `data` property (for tests)
    if (response?.data) {
      if (
        response.data.id &&
        response.data.username &&
        typeof response.data.displayName === 'string'
      ) {
        return response.data;
      }
    }

    // Validate response
    if (
      !response ||
      !response.id ||
      !response.username ||
      typeof response.displayName !== 'string'
    ) {
      console.error(
        '[ProfileService] Invalid user profile response:',
        JSON.stringify(response)
      );
      throw new Error('Invalid user profile data received');
    }

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
