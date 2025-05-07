import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import { User } from '../types/user';

// Update the interface to match the actual server response
// The server returns an array of actors directly, not an object with an actors property
interface SearchActorsResponse {
  actors?: User[]; // For backward compatibility if format changes
}

/**
 * Searches for actors based on a query.
 * Defensively selects only non-sensitive fields for each user.
 */
export const searchActors = async (query: string): Promise<User[]> => {
  if (!query.trim()) {
    return []; // Return empty if query is empty or whitespace
  }

  try {
    console.log(
      `[ActorService] Searching for actors with query: "${query.trim()}"`
    );
    const endpoint = `${ApiEndpoints.searchActors}?q=${encodeURIComponent(query.trim())}`;
    console.log(`[ActorService] Endpoint: ${endpoint}`);

    const response = await apiClient.get(endpoint);

    // Check various response formats to handle server response format
    if (response) {
      console.log(`[ActorService] Response received, type: ${typeof response}`);

      // Server returns array of actors directly
      if (Array.isArray(response)) {
        console.log(
          `[ActorService] Server returned array of ${response.length} actors directly`
        );
        return response.map(mapUserFields);
      }

      // For backward compatibility, if server returns { actors: [...] }
      if (response.actors && Array.isArray(response.actors)) {
        console.log(
          `[ActorService] Server returned ${response.actors.length} actors in "actors" property`
        );
        return response.actors.map(mapUserFields);
      }

      // For contract tests, the mock response format might be different
      if (response._id && response.username) {
        console.log('[ActorService] Single user object detected');
        return [mapUserFields(response)];
      }

      // Log the unexpected response format to help with debugging
      console.log(
        '[ActorService] Unexpected response format:',
        JSON.stringify(response, null, 2).substring(0, 200) + '...'
      );
    }

    console.error(
      '[ActorService] Invalid search response structure:',
      response ? `Response type: ${typeof response}` : 'No response received'
    );
    throw new Error('Invalid data received for actor search.');
  } catch (error) {
    console.error(
      '[ActorService] Error searching actors:',
      error instanceof Error ? error.message : error
    );
    throw error;
  }
};

// Helper function to defensively map user fields
const mapUserFields = (actor: any): User => ({
  _id: actor._id,
  id: actor.id,
  username: actor.username,
  preferredUsername: actor.preferredUsername,
  ...(actor.displayName && { displayName: actor.displayName }),
  ...(actor.avatarUrl && { avatarUrl: actor.avatarUrl }),
  ...(actor.bio && { bio: actor.bio }),
  ...(actor.icon && { icon: actor.icon }),
  ...(actor.iconUrl && { iconUrl: actor.iconUrl }),
  ...(actor.followersCount !== undefined && {
    followersCount: actor.followersCount,
  }),
  ...(actor.followingCount !== undefined && {
    followingCount: actor.followingCount,
  }),
});
