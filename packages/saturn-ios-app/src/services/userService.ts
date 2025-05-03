import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { User } from '../types/user'; // Import non-sensitive User type

// Define the response type from the backend
interface UserApiResponse {
  _id: string;
  id: string;
  username: string;
  preferredUsername?: string;
  displayName?: string;
  // Add other potential fields returned by the API
  // email?: string; // This would be filtered out
  // password?: string; // This would be filtered out
  // etc.
}

/**
 * Fetches the current authenticated user's data.
 * IMPORTANT: Selectively returns only non-sensitive fields defined in the User type.
 */
export const fetchCurrentUserData = async (): Promise<User> => {
  // Use the correct typing for the API response
  const response = await apiClient.get<UserApiResponse, UserApiResponse>(
    ApiEndpoints.me
  );

  // --- Defensive Data Selection ---
  // Ensure only fields defined in our frontend User type are returned.
  // This prevents accidentally using sensitive data leaked by the API.
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid user data received from API');
  }

  const userData: User = {
    _id: response._id,
    id: response.id,
    username: response.username,
    // Optional fields - include only if they exist in the response
    ...(response.preferredUsername && {
      preferredUsername: response.preferredUsername,
    }),
    ...(response.displayName && { displayName: response.displayName }),
    // Add other expected non-sensitive fields here (e.g., avatar)
    // Example: ...(response.icon?.url && { avatarUrl: response.icon.url }),
  };

  // Validate essential fields are present
  if (!userData._id || !userData.id || !userData.username) {
    console.error('Fetched user data missing essential fields:', response);
    throw new Error('Incomplete user data received from API');
  }

  return userData;
};
