import { getToken } from '../services/tokenStorage';

/**
 * Adds authorization header with JWT token if available
 */
export const addAuthHeader = async (): Promise<Record<string, string>> => {
  try {
    const token = await getToken();
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }

  return {};
};
