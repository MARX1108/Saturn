import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchActors } from '../services/actorService';
import { User } from '../types/user';
import { ApiError } from '../types/api';

export const USER_SEARCH_QUERY_KEY = (query: string) => ['userSearch', query];
const MIN_QUERY_LENGTH = 2; // Minimum characters to trigger search
const DEBOUNCE_DELAY = 500; // ms

export const useUserSearch = (searchQuery: string) => {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim().length >= MIN_QUERY_LENGTH) {
        setDebouncedQuery(searchQuery.trim());
      } else {
        setDebouncedQuery(''); // Clear if query too short
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler); // Cleanup timeout
    };
  }, [searchQuery]); // Re-run effect when searchQuery changes

  const isEnabled = debouncedQuery.length >= MIN_QUERY_LENGTH;

  return useQuery<User[], ApiError>({
    queryKey: USER_SEARCH_QUERY_KEY(debouncedQuery),
    queryFn: () => searchActors(debouncedQuery),
    enabled: isEnabled, // Only run query if debouncedQuery is valid and long enough
    staleTime: 1000 * 60 * 1, // 1 minute stale time for search results
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
