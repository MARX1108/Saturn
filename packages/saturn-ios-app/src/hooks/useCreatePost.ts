import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../services/postService';
import { Post } from '../types/post';
import { ApiError } from '../types/api';
import { FEED_POSTS_QUERY_KEY } from './useFeedPosts';

interface CreatePostBody {
  content: string;
  // Add other fields if needed by API
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<Post, ApiError, CreatePostBody>({
    mutationFn: async (data) => {
      try {
        return await createPost(data);
      } catch (error) {
        console.error('Error in mutation function:', error);
        // Ensure we're always throwing an ApiError or Error object
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to create post');
      }
    },
    onSuccess: (newPost) => {
      try {
        console.log('Post created successfully:', newPost?.id || 'unknown ID');
        // Safely invalidate the query
        void queryClient
          .invalidateQueries({ queryKey: FEED_POSTS_QUERY_KEY })
          .catch((invalidateError) => {
            console.error('Error invalidating queries:', invalidateError);
          });
      } catch (successError) {
        console.error('Error in onSuccess handler:', successError);
      }
    },
    onError: (error) => {
      try {
        console.error('Failed to create post:', error);
        // Error handling is done in the component that calls this hook
      } catch (errorHandlerError) {
        console.error('Error in onError handler:', errorHandlerError);
      }
    },
    // Add retry with sensible limits
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second between retries
  });

  return mutation;
};
