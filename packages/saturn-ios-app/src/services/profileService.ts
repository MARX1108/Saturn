import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { User } from '../types/user';

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
  // These are the sensitive fields we want to filter out
  email?: string;
  password?: string;
  passwordHash?: string;
  // There could be other fields here that we don't need
  [key: string]: unknown;
}

/**
 * Fetches public profile data for a given username.
 * IMPORTANT: Selectively returns only non-sensitive fields defined in the User type.
 */
export const fetchUserProfileByUsername = async (
  username: string
): Promise<User> => {
  if (!username) {
    throw new Error('Username is required to fetch profile.');
  }

  try {
    // Log the exact URL we're calling
    const url = ApiEndpoints.getActorByUsername(username);
    console.log(
      `[ProfileService] Fetching profile for username: ${username}, URL: ${url}`
    );

    // Note: apiClient.get<T> will return the data directly due to the response interceptor
    const responseData = await apiClient.get<ActorResponse, ActorResponse>(url);

    // Cast/validate the response as our expected type
    const data = responseData;

    // --- Defensive Data Selection ---
    if (!data || typeof data !== 'object') {
      console.error('[ProfileService] Invalid response:', responseData);
      throw new Error('Invalid user profile data received from API');
    }

    // Create a User object with only the non-sensitive fields we want
    // This is our defense against the backend leaking sensitive data
    const profileData: User = {
      _id: data._id,
      id: data.id,
      username: data.username,
      // Optional fields - include only if they exist in the response AND are non-sensitive
      ...(data.preferredUsername && {
        preferredUsername: data.preferredUsername,
      }),
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
      ...(data.bio && { bio: data.bio }),
      ...(typeof data.followersCount === 'number' && {
        followersCount: data.followersCount,
      }),
      ...(typeof data.followingCount === 'number' && {
        followingCount: data.followingCount,
      }),
      // Explicitly DO NOT include email, password, etc. even if the API returns them
    };

    // Validate essential fields are present
    if (!profileData._id || !profileData.id || !profileData.username) {
      console.error(
        '[ProfileService] Missing essential fields in profile data:',
        data
      );
      throw new Error('Incomplete user profile data received from API');
    }

    // Log a warning if we detect the response contains sensitive fields that we're filtering out
    if (data.email || data.password || data.passwordHash) {
      console.warn(
        '[ProfileService] WARNING: API returned sensitive data that frontend is filtering out'
      );
    }

    return profileData;
  } catch (error: any) {
    // Provide more specific error messages for debugging
    if (error.response && error.response.status === 404) {
      console.error(
        `[ProfileService] User with username "${username}" not found`
      );
      // Add the 404 status to the error for proper handling in useUserProfile
      const notFoundError = new Error(`User "${username}" not found`);
      (notFoundError as any).status = 404;
      throw notFoundError;
    }

    console.error('[ProfileService] Error fetching user profile:', error);
    throw error; // Rethrow to be handled by the query
  }
};
