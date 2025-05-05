import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';
import { useUserProfile } from '../../hooks/useUserProfile';
import TestWrapper from '../../test/TestWrapper';
import { User } from '../../types/user';

// Mock the useUserProfile hook
jest.mock('../../hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

// Mock the React Navigation hooks
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): Record<string, jest.Mock> => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: (): Record<string, unknown> => ({
    params: { username: 'testuser' },
  }),
}));

// Mock store hooks
jest.mock('../../store/hooks', () => ({
  useAppSelector: jest.fn(() => ({
    username: 'loggedinuser', // Different from profile to test non-own profile
  })),
}));

// Sample user data for mocking
const mockUser: User = {
  id: 'user1',
  _id: 'user1',
  username: 'testuser',
  displayName: 'Test User',
  bio: 'This is a test bio',
  followersCount: 100,
  followingCount: 50,
  isFollowing: false,
};

describe('ProfileScreen', (): void => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading state when profile is loading', (): void => {
    (useUserProfile as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <ProfileScreen />
      </TestWrapper>
    );

    expect(getByText('Loading Profile...')).toBeTruthy();
  });

  it('displays profile data when loaded', (): void => {
    (useUserProfile as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText, getAllByText } = render(
      <TestWrapper>
        <ProfileScreen />
      </TestWrapper>
    );

    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('@testuser')).toBeTruthy();
    expect(getByText('This is a test bio')).toBeTruthy();
    expect(getByText('50')).toBeTruthy(); // Testing just the number

    // Check if "Following" exists anywhere in the rendered text
    const followingTextElements = getAllByText(/Following/);
    expect(followingTextElements.length).toBeGreaterThan(0);
  });

  it('displays error state when there is an error', (): void => {
    (useUserProfile as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load profile'),
      refetch: jest.fn(),
    });

    const { getByText } = render(
      <TestWrapper>
        <ProfileScreen />
      </TestWrapper>
    );

    expect(getByText('Error loading profile:')).toBeTruthy();
  });
});
