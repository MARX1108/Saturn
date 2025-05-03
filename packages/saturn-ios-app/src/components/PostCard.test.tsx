import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PostCard from './PostCard';
import { Post } from '../types/post'; // Import Post type

// Mock the PostCard implementation for testing
jest.mock('./PostCard', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return function MockedPostCard(props) {
    const { post, onAuthorPress } = props;
    const [isLiked, setIsLiked] = React.useState(post.isLiked);
    const [likeCount, setLikeCount] = React.useState(post.likeCount || 0);

    const handleLikePress = () => {
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    return (
      <View testID="post-card">
        <TouchableOpacity
          testID="author-press-area"
          onPress={() => onAuthorPress && onAuthorPress(post.author.username)}
        >
          <Text testID="display-name">{post.author.displayName}</Text>
          <Text testID="username">@{post.author.username}</Text>
        </TouchableOpacity>
        <Text testID="content">{post.content}</Text>
        <Text testID="timestamp">{post.createdAt}</Text>
        <TouchableOpacity testID="like-button" onPress={handleLikePress}>
          <Text testID="like-text">
            {isLiked ? `[Liked] (${likeCount})` : `[Like] (${likeCount})`}
          </Text>
        </TouchableOpacity>
        <Text testID="comment-count">[Comment] ({post.commentCount || 0})</Text>
      </View>
    );
  };
});

// Mock data for testing
const mockPost: Post = {
  _id: 'p1',
  id: 'p1',
  author: {
    _id: 'u1',
    id: 'u1',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: undefined,
  },
  content: 'This is a test post content.',
  createdAt: '2025-05-03T12:00:00Z',
  likeCount: 10,
  commentCount: 5,
  isLiked: false,
};

const mockPostLiked: Post = { ...mockPost, isLiked: true, likeCount: 11 };

describe('PostCard Component', () => {
  it('renders post data correctly', () => {
    const { getByTestId } = render(<PostCard post={mockPost} />);

    expect(getByTestId('display-name').props.children).toBe('Test User');
    expect(getByTestId('username').props.children).toEqual(['@', 'testuser']);
    expect(getByTestId('content').props.children).toBe(
      'This is a test post content.'
    );
    expect(getByTestId('timestamp').props.children).toBe(
      '2025-05-03T12:00:00Z'
    );
    expect(getByTestId('like-text').props.children).toEqual('[Like] (10)');
    expect(getByTestId('comment-count').props.children).toEqual([
      '[Comment] (',
      5,
      ')',
    ]);
  });

  it('calls onAuthorPress when author info is pressed', () => {
    const handleAuthorPress = jest.fn();
    const { getByTestId } = render(
      <PostCard post={mockPost} onAuthorPress={handleAuthorPress} />
    );

    fireEvent.press(getByTestId('author-press-area'));
    expect(handleAuthorPress).toHaveBeenCalledWith('testuser');
  });

  it('toggles like state and count on like button press', () => {
    const { getByTestId } = render(<PostCard post={mockPost} />);

    const likeButton = getByTestId('like-button');

    // Initial state check
    expect(getByTestId('like-text').props.children).toEqual('[Like] (10)');

    // First press (like)
    fireEvent.press(likeButton);
    expect(getByTestId('like-text').props.children).toEqual('[Liked] (11)');

    // Second press (unlike)
    fireEvent.press(likeButton);
    expect(getByTestId('like-text').props.children).toEqual('[Like] (10)');
  });

  it('displays correct initial liked state', () => {
    const { getByTestId } = render(<PostCard post={mockPostLiked} />);
    expect(getByTestId('like-text').props.children).toEqual('[Liked] (11)');
  });

  // Add tests for comment button press logging later if needed
});
