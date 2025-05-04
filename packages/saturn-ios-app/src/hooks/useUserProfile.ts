import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchUserProfileByUsername } from '../services/profileService';
import { User } from '../types/user';
import { ApiError } from '../types/api';

// Define query key factory
export const PROFILE_QUERY_KEY = (username: string): string[] => [
  'userProfile',
  username,
];

export const useUserProfile = (
  username: string | undefined
): UseQueryResult<User, ApiError> => {
  // Enable query only if username is provided
  const isEnabled = !!username;

  return useQuery<User, ApiError>({
    queryKey: PROFILE_QUERY_KEY(username ?? ''), // Use username in query key
    queryFn: () => fetchUserProfileByUsername(username!), // Pass username to fetch function, assert non-null due to enabled flag
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
    gcTime: 1000 * 60 * 30, // 30 minutes cache time (formerly cacheTime)
    retry: (failureCount, error) => {
      // Don't retry on 404 (Not Found) errors
      if (error?.status === 404) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    refetchOnWindowFocus: true,
    // onSuccess/onError handled via return status flags below
  });
};
