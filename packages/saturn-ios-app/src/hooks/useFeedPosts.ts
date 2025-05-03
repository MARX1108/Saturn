import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { fetchFeedPosts } from '../services/postService';
import { Post } from '../types/post';
import { ApiError } from '../types/api';

// Define query key
export const FEED_POSTS_QUERY_KEY = ['feedPosts'];

export const useFeedPosts = () => {
  const queryClient = useQueryClient();
  // Enable query only when authenticated
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === 'authenticated'
  );

  const queryResult = useQuery<Post[], ApiError>({
    queryKey: FEED_POSTS_QUERY_KEY,
    queryFn: fetchFeedPosts,
    enabled: isAuthenticated, // Only run query if authenticated
    staleTime: 1000 * 60 * 2, // Data is stale after 2 minutes
    gcTime: 1000 * 60 * 30, // Garbage collection time (formerly cacheTime)
    refetchOnWindowFocus: true,
    // onSuccess/onError handled via queryResult status flags below
  });

  // Function to manually refetch data (for pull-to-refresh)
  const refetch = async (): Promise<void> => {
    if (!queryResult.isRefetching) {
      // Prevent multiple simultaneous refetches
      console.log('[useFeedPosts] Refetching feed posts...');
      await queryResult.refetch();
      console.log('[useFeedPosts] Refetch complete.');
    }
  };

  // Optional: Function to invalidate cache (e.g., after creating a new post)
  const invalidateFeedCache = (): void => {
    void queryClient.invalidateQueries({ queryKey: FEED_POSTS_QUERY_KEY });
  };

  return {
    ...queryResult, // Includes data, isLoading, isError, error, isFetching, isRefetching, etc.
    refetch,
    invalidateFeedCache,
  };
};
