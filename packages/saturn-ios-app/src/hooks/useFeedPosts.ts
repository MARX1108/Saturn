import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useAppSelector } from '../store/hooks';
import { fetchFeedPosts } from '../services/postService';
import { Post } from '../types/post';
import { ApiError } from '../types/api';

// Define query key
export const FEED_POSTS_QUERY_KEY = ['feedPosts'];

// Define the interface properly without extending UseQueryResult
interface UseFeedPostsResult {
  data: Post[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  isRefetching: boolean;
  refetch: () => Promise<void>;
  invalidateFeedCache: () => void;
}

export const useFeedPosts = (): UseFeedPostsResult => {
  const queryClient = useQueryClient();
  // Enable query only when authenticated
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === 'authenticated'
  );

  // Define query options with proper typing
  const queryOptions: UseQueryOptions<Post[], ApiError, Post[]> = {
    queryKey: FEED_POSTS_QUERY_KEY,
    queryFn: async () => {
      try {
        // Wrap the original function to add extra error handling
        return await fetchFeedPosts();
      } catch (error) {
        console.error('[useFeedPosts] Error in query function:', error);

        // Check if it's the specific "Author not found" error
        if (
          error instanceof Error &&
          error.message.includes('Author not found for post')
        ) {
          console.log(
            '[useFeedPosts] Returning empty array for author not found error'
          );
          return []; // Return empty array instead of throwing
        }

        // Otherwise rethrow
        throw error;
      }
    },
    enabled: isAuthenticated, // Only run query if authenticated
    staleTime: 1000 * 60 * 2, // Data is stale after 2 minutes
    gcTime: 1000 * 60 * 30, // Garbage collection time (formerly cacheTime)
    refetchOnWindowFocus: false, // Disable for React Native
  };

  // Add a custom error handler
  const handleError = (error: ApiError): void => {
    // Log detailed error information
    console.error(
      '[useFeedPosts] Feed query error:',
      JSON.stringify(error, null, 2)
    );

    // Specific handling for "Author not found" error
    if (
      error.status === 404 &&
      error.message?.includes('Author not found for post')
    ) {
      console.error(
        '[useFeedPosts] This is a backend data integrity issue where posts reference non-existent authors'
      );
    }
  };

  const queryResult = useQuery<Post[], ApiError, Post[]>(queryOptions);

  // Add error handling outside the query options
  if (queryResult.error) {
    handleError(queryResult.error);
  }

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
    data: queryResult.data,
    isLoading: queryResult.isLoading,
    isError: queryResult.isError,
    error: queryResult.error || null,
    isRefetching: queryResult.isRefetching,
    refetch,
    invalidateFeedCache,
  };
};
