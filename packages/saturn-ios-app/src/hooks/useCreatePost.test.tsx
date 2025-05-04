import { renderHook, act } from '@testing-library/react-hooks';
import { useCreatePost } from './useCreatePost';
import { createPost } from '../services/postService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { FEED_POSTS_QUERY_KEY } from './useFeedPosts';

// Mock the service function
jest.mock('../services/postService');
const mockedCreatePost = createPost as jest.Mock;

// Mock QueryClient's invalidateQueries
const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
}));

// Wrapper component with QueryClientProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCreatePost Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient.clear();
  });

  it('should call createPost service when mutate is called', async () => {
    const { result } = renderHook(() => useCreatePost(), { wrapper });
    const postData = { content: 'Hook test content' };
    const mockResponse = { id: 'post1', ...postData };

    mockedCreatePost.mockResolvedValue(mockResponse);

    act(() => {
      result.current.mutate(postData);
    });

    // Add a small delay to let the mutation complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(mockedCreatePost).toHaveBeenCalledWith(postData);
  });

  it('should invalidate feed query on success', async () => {
    const { result } = renderHook(() => useCreatePost(), { wrapper });

    // Create a mock response
    const mockResponse = { id: 'post3', content: 'test' };
    mockedCreatePost.mockResolvedValue(mockResponse);

    // Trigger the mutation
    act(() => {
      result.current.mutate({ content: 'test' });
    });

    // Add a small delay to let the mutation complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check if invalidateQueries was called with the right query key
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: FEED_POSTS_QUERY_KEY,
    });
  });
});
