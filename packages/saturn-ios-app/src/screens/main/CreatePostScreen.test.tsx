import React from 'react';
import { render } from '@testing-library/react-native';
import CreatePostScreen from './CreatePostScreen';
import { useCreatePost } from '../../hooks/useCreatePost';

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
  useNavigation: () => ({
    goBack: jest.fn(),
    setOptions: jest.fn(),
    dispatch: jest.fn(),
  }),
  StackActions: {
    pop: () => ({ type: 'POP' }),
  },
  CommonActions: {
    navigate: (params: any) => ({ type: 'NAVIGATE', payload: params }),
  },
}));

// Setup the basic mock for useCreatePost
beforeEach(() => {
  (useCreatePost as jest.Mock).mockReturnValue({
    mutate: jest.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  });
});

// Simple smoke test
it('renders without crashing', () => {
  expect(() => render(<CreatePostScreen />)).not.toThrow();
});
