import React from 'react';
import { render } from '@testing-library/react-native';
import CreatePostScreen from './CreatePostScreen';
import { useCreatePost } from '../../hooks/useCreatePost';

// Define a proper type for navigation params
interface NavigationParam {
  screen?: string;
  name?: string;
  params?: Record<string, unknown>;
}

// Mock all the dependencies
jest.mock('../../hooks/useCreatePost', () => ({
  useCreatePost: jest.fn(),
}));

// Mock React Native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): object => ({
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
  }),
  StackActions: {
    pop: (): { type: string } => ({ type: 'POP' }),
  },
  CommonActions: {
    navigate: (
      params: NavigationParam
    ): { type: string; payload: NavigationParam } => ({
      type: 'NAVIGATE',
      payload: params,
    }),
  },
}));

// Setup the basic mock for useCreatePost
beforeEach((): void => {
  (useCreatePost as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  });
});

// Simple smoke test
it('renders without crashing', (): void => {
  expect(() => render(<CreatePostScreen />)).not.toThrow();
});
