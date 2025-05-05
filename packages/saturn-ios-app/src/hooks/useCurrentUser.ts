import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  setUser,
  setStatus,
  clearCredentials,
  setProfileComplete,
} from '../store/slices/authSlice';
import { fetchCurrentUserData } from '../services/userService';
import { ApiError } from '../types/api';
import { removeToken } from '../services/tokenStorage';
import { User } from '../types/user';
import { useEffect } from 'react';

// Define query key
const USER_QUERY_KEY = ['currentUser'];

export const useCurrentUser = (): UseQueryResult<User, Error> => {
  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const token = useAppSelector((state) => state.auth.token); // Need token to ensure query runs only when logged in

  const isEnabled = authStatus === 'authenticated' && !!token; // Enable query only when authenticated

  const query = useQuery<User, Error>({
    queryKey: USER_QUERY_KEY,
    queryFn: fetchCurrentUserData,
    enabled: isEnabled, // Control query execution
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour cache time (formerly cacheTime)
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Disable for React Native
  });

  // Handle success case
  useEffect(() => {
    if (query.isSuccess && query.data) {
      console.log(
        '[useCurrentUser] Successfully fetched user data:',
        query.data.username
      );

      // Check for profile completeness
      const isProfileComplete = !!query.data.displayName?.trim();
      if (!isProfileComplete) {
        console.warn(
          `[useCurrentUser] User profile for ${query.data.username} might be incomplete (missing displayName). Triggering profile navigation.`
        );
      }

      // Store profile completeness in Redux
      dispatch(setProfileComplete(isProfileComplete));

      // Update user data in RTK store with the typed user data
      dispatch(setUser(query.data));

      // Ensure status reflects success if it was loading
      if (authStatus === 'loading') {
        dispatch(setStatus('authenticated'));
      }
    }
  }, [query.isSuccess, query.data, dispatch, authStatus]);

  // Handle error case
  useEffect(() => {
    if (query.isError && query.error) {
      console.error('[useCurrentUser] Failed to fetch user data:', query.error);

      // Handle specific errors, e.g., 401 Unauthorized might mean token expired
      const apiError = query.error as unknown as ApiError;
      if (apiError.status === 401) {
        console.warn(
          '[useCurrentUser] Unauthorized fetching user data. Logging out.'
        );
        // Clear credentials and token if fetch fails due to auth error
        dispatch(clearCredentials());
        void removeToken(); // Remove token from storage (using void to handle promise)
      } else {
        // Set status to failed only if not already authenticated
        // (avoids flicker if background refresh fails but user was already logged in)
        if (authStatus !== 'authenticated') {
          dispatch(setStatus('failed'));
        }
        // Optionally show error to user via toast/notification service later
      }
    }
  }, [query.isError, query.error, dispatch, authStatus]);

  return query;
};
