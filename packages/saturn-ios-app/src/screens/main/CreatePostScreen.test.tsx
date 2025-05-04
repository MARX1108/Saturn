import React from 'react';
import { render } from '@testing-library/react-native';
import CreatePostScreen from './CreatePostScreen';
import { useCreatePost } from '../../hooks/useCreatePost';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import TestWrapper from '../../test/TestWrapper';

// Mock for store hooks is now handled by our wrapper
// But we'll mock the specific selectors we need
jest.mock('../../store/hooks', () => ({
  useAppSelector: jest.fn(() => true), // Mock authenticated state
}));

// Mock type to match component expectation
type CreatePostScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CreatePostModal'
>;

// Mock all the dependencies
jest.mock('../../hooks/useCreatePost', () => ({
  useCreatePost: jest.fn(),
}));

// Mock React Native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock React Navigation
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

const mockNavigation = {
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  dispatch: mockDispatch,
  navigate: mockNavigate,
};

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => mockNavigation,
    StackActions: {
      pop: jest.fn(() => ({ type: 'POP' })),
    },
    CommonActions: {
      navigate: jest.fn((params) => ({
        type: 'NAVIGATE',
        payload: params,
      })),
    },
  };
});

// Setup the basic mock for useCreatePost
beforeEach((): void => {
  jest.clearAllMocks();
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
  expect(() =>
    render(
      <TestWrapper>
        <CreatePostScreen />
      </TestWrapper>
    )
  ).not.toThrow();
});
