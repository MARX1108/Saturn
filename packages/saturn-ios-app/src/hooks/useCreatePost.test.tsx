import { renderHook, act } from '@testing-library/react-hooks';
import { useCreatePost } from './useCreatePost';
import { createPost } from '../services/postService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { FEED_POSTS_QUERY_KEY } from './useFeedPosts';
import { Post } from '../types/post';

// Type definition for query client mock function
type InvalidateQueriesFn = (options: { queryKey: string[] }) => Promise<void>;

// Mock the service function
jest.mock('../services/postService');
const mockedCreatePost = createPost as jest.Mock;

// Define the return type for useQueryClient mock
interface MockQueryClient {
  invalidateQueries: InvalidateQueriesFn;
}

// Mock QueryClient's invalidateQueries
const mockInvalidateQueries = jest
  .fn()
  .mockResolvedValue(undefined) as jest.Mock<Promise<void>>;

// Make sure we don't mock QueryClient itself
jest.mock('@tanstack/react-query', () => {
  const actualModule = jest.requireActual('@tanstack/react-query');
  return {
    ...actualModule,
    useQueryClient: (): MockQueryClient => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

// Wrapper component with QueryClientProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Use React.ReactElement instead of JSX.Element
const wrapper = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCreatePost Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should call createPost service when mutate is called', async () => {
    const { result, waitFor } = renderHook(() => useCreatePost(), { wrapper });
    const postData = { content: 'Hook test content' };
    const mockResponse = { id: 'post1', ...postData } as unknown as Post;

    mockedCreatePost.mockResolvedValue(mockResponse);

    act(() => {
      result.current.mutate(postData);
    });

    // Wait for the mutation to complete
    await waitFor(() =>
      expect(mockedCreatePost).toHaveBeenCalledWith(postData)
    );
  });

  it('should invalidate feed query on success', async () => {
    const { result, waitFor } = renderHook(() => useCreatePost(), { wrapper });

    // Create a mock response
    const mockResponse = { id: 'post3', content: 'test' } as unknown as Post;
    mockedCreatePost.mockResolvedValue(mockResponse);

    // Trigger the mutation
    act(() => {
      result.current.mutate({ content: 'test' });
    });

    // Wait for invalidateQueries to be called
    await waitFor(() =>
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: FEED_POSTS_QUERY_KEY,
      })
    );
  });
});
