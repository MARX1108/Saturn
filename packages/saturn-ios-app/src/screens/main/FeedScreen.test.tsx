import React from 'react';
import { render } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';
import { useFeedPosts } from '../../hooks/useFeedPosts';
import TestWrapper from '../../test/TestWrapper';
import { Post } from '../../types/post';

// Mock the useFeedPosts hook
jest.mock('../../hooks/useFeedPosts', () => ({
  useFeedPosts: jest.fn(),
}));

// Mock the React Navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): Record<string, jest.Mock> => ({
    navigate: jest.fn(),
  }),
}));

// Sample post data for mocking
const mockPosts: Post[] = [
  {
    id: 'post1',
    _id: 'post1',
    content: 'Test post 1',
    author: {
      id: 'user1',
      _id: 'user1',
      username: 'testuser1',
      displayName: 'Test User 1',
    },
    createdAt: '2023-01-01T00:00:00Z',
    likeCount: 5,
    commentCount: 2,
    isLiked: false,
  },
  {
    id: 'post2',
    _id: 'post2',
    content: 'Test post 2',
    author: {
      id: 'user2',
      _id: 'user2',
      username: 'testuser2',
      displayName: 'Test User 2',
    },
    createdAt: '2023-01-02T00:00:00Z',
    likeCount: 10,
    commentCount: 3,
    isLiked: true,
  },
];

describe('FeedScreen', (): void => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state when posts are loading', (): void => {
    (useFeedPosts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <FeedScreen />
      </TestWrapper>
    );

    expect(getByText('Loading Feed...')).toBeTruthy();
  });

  it('displays posts when data is loaded', (): void => {
    (useFeedPosts as jest.Mock).mockReturnValue({
      data: mockPosts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = render(
      <TestWrapper>
        <FeedScreen />
      </TestWrapper>
    );

    expect(getByTestId('feed-flatlist')).toBeTruthy();
  });

  it('displays error state when there is an error', (): void => {
    (useFeedPosts as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: new Error('Failed to load posts'),
      refetch: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <FeedScreen />
      </TestWrapper>
    );

    expect(getByText('Error loading feed:')).toBeTruthy();
    expect(getByText('Error loading feed. Please try again.')).toBeTruthy();
  });
});
