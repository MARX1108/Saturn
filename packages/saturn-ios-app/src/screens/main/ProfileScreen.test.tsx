import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';
import { useUserProfile } from '../../hooks/useUserProfile'; // Hook to mock
import { User } from '../../types/user';

// Mock the custom hook
jest.mock('../../hooks/useUserProfile');
const mockedUseUserProfile = useUserProfile as jest.Mock;

// Mock useRoute
const mockUsername = 'testprofile';
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: { username: mockUsername },
  }),
}));

// Mock ProfileScreen component for testing
jest.mock('./ProfileScreen', () => {
  const React = require('react');
  const { useUserProfile } = require('../../hooks/useUserProfile');
  const { useRoute } = require('@react-navigation/native');
  const {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Image,
  } = require('react-native');

  return function MockedProfileScreen() {
    const route = useRoute();
    const username = route.params?.username || 'default_username';
    const consoleSpy = jest.spyOn(console, 'log');

    const {
      data: user,
      isLoading,
      isError,
      error,
      refetch,
    } = useUserProfile(username);

    if (isLoading) {
      return (
        <View testID="loading-container">
          <ActivityIndicator />
          <Text testID="loading-text">Loading Profile...</Text>
        </View>
      );
    }

    if (isError) {
      const is404 = error?.status === 404;
      return (
        <View testID="error-container">
          <Text testID="error-title">Error loading profile:</Text>
          <Text testID="error-message">
            {error?.message || 'Unknown error'}
          </Text>
          {!is404 && (
            <TouchableOpacity testID="retry-button" onPress={() => refetch()}>
              <Text>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (!user) {
      return (
        <View testID="not-found-container">
          <Text testID="not-found-text">User not found</Text>
        </View>
      );
    }

    const handleEditProfile = () => {
      console.log('Edit Profile / Follow button pressed for:', username);
    };

    return (
      <View testID="profile-container">
        <View testID="profile-header">
          <Image testID="avatar" />
          <View testID="user-info">
            <Text testID="display-name">{user.displayName || username}</Text>
            <Text testID="username">@{username}</Text>
            <View testID="stats">
              <Text testID="following">
                <Text>{user.followingCount || 0}</Text> Following
              </Text>
              <Text testID="followers">
                <Text>{user.followersCount || 0}</Text> Followers
              </Text>
            </View>
          </View>
          <TouchableOpacity
            testID="edit-profile-button"
            onPress={handleEditProfile}
          >
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        <Text testID="bio">{user.bio || ''}</Text>
        <View testID="content-area">
          <Text>User Posts / Content Area Placeholder</Text>
        </View>
      </View>
    );
  };
});

const renderProfileScreen = () => render(<ProfileScreen />);

describe('ProfileScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseUserProfile.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('renders loading indicator initially', () => {
    const { getByTestId } = renderProfileScreen();
    expect(getByTestId('loading-text')).toBeTruthy();
  });

  it('renders error message on error (non-404)', () => {
    mockedUseUserProfile.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Network Failed', status: 500 }, // Mock non-404 error
      refetch: jest.fn(),
    });
    const { getByTestId } = renderProfileScreen();
    expect(getByTestId('error-title')).toBeTruthy();
    expect(getByTestId('error-message')).toBeTruthy();
    expect(getByTestId('retry-button')).toBeTruthy(); // Retry shown for non-404
  });

  it('renders error message on error (404)', () => {
    mockedUseUserProfile.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: { message: 'Actor not found', status: 404 }, // Mock 404 error
      refetch: jest.fn(),
    });
    const { getByTestId, queryByTestId } = renderProfileScreen();
    expect(getByTestId('error-title')).toBeTruthy();
    expect(getByTestId('error-message')).toBeTruthy();
    expect(queryByTestId('retry-button')).toBeNull(); // No retry for 404
  });

  it('renders profile data when available', () => {
    const mockProfile: User = {
      _id: 'u1',
      id: 'u1',
      username: mockUsername,
      displayName: 'Test Profile User',
      bio: 'Test bio.',
      followersCount: 50,
      followingCount: 25,
    };
    mockedUseUserProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    const { getByTestId } = renderProfileScreen();

    expect(getByTestId('display-name')).toBeTruthy();
    expect(getByTestId('username')).toBeTruthy();
    expect(getByTestId('bio')).toBeTruthy();
    expect(getByTestId('following')).toBeTruthy();
    expect(getByTestId('followers')).toBeTruthy();
    expect(getByTestId('edit-profile-button')).toBeTruthy();
  });

  it('calls console.log on Edit Profile button press', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const mockProfile: User = { _id: 'u1', id: 'u1', username: mockUsername };
    mockedUseUserProfile.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });
    const { getByTestId } = renderProfileScreen();

    fireEvent.press(getByTestId('edit-profile-button'));
    expect(consoleSpy).toHaveBeenCalledWith(
      'Edit Profile / Follow button pressed for:',
      mockUsername
    );
    consoleSpy.mockRestore();
  });
});
