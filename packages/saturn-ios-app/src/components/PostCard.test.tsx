/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PostCard from './PostCard';
import { Post } from '../types/post';
import TestWrapper from '../test/TestWrapper';

// Unmock the actual PostCard component to test it properly
jest.unmock('./PostCard');

// Mock navigation as it might be used in the PostCard
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: (): Record<string, jest.Mock> => ({
      navigate: jest.fn(),
    }),
  };
});

// Mock post data for testing
const mockPost: Post = {
  _id: 'p1',
  id: 'p1',
  author: {
    _id: 'u1',
    id: 'u1',
    username: 'user1',
    displayName: 'User One',
  },
  content: 'Test post content',
  createdAt: '2023-01-01T00:00:00Z',
  likeCount: 5,
  commentCount: 2,
  isLiked: false,
};

// Liked post variation
const mockPostLiked: Post = {
  ...mockPost,
  isLiked: true,
  likeCount: 6,
};

describe('PostCard Component', () => {
  it('renders post data correctly', (): void => {
    const { getByText } = render(
      <TestWrapper>
        <PostCard post={mockPost} />
      </TestWrapper>
    );

    // Check if the content is displayed
    expect(getByText('Test post content')).toBeTruthy();
    // Check for author name
    expect(getByText('User One')).toBeTruthy();
    // Check for username
    expect(getByText('@user1')).toBeTruthy();
  });

  it('calls onAuthorPress when author info is pressed', (): void => {
    const mockAuthorPress = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <PostCard post={mockPost} onAuthorPress={mockAuthorPress} />
      </TestWrapper>
    );

    // Find the author element and press it using fireEvent
    // Using a safer approach with getByText and then finding the parent element
    const authorName = getByText('User One');

    // Get the closest TouchableOpacity parent (author container)
    const authorContainer = authorName.parent?.parent;
    if (!authorContainer) {
      throw new Error('Could not find author container');
    }

    // Trigger press event on the author container
    fireEvent.press(authorContainer);

    // Check if the callback was called with the username
    expect(mockAuthorPress).toHaveBeenCalledWith('user1');
  });

  it('displays post with liked state correctly', (): void => {
    const { getByText } = render(
      <TestWrapper>
        <PostCard post={mockPostLiked} />
      </TestWrapper>
    );

    // Check if like button shows the correct count
    expect(getByText(/\[Liked\] \(6\)/)).toBeTruthy();
  });
});
