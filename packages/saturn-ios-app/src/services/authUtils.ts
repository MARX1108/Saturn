import { getToken } from './tokenStorage';

/**
 * Utility function to add authorization header to API requests
 * @returns Headers with Authorization header if token exists
 */
export const addAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('[AuthUtils] Added Authorization header: Bearer xxx...');
  } else {
    console.log('[AuthUtils] No token available for Authorization header');
  }

  return headers;
};
