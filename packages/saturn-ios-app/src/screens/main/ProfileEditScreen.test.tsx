/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileEditScreen from './ProfileEditScreen';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useAppSelector } from '../../store/hooks';
import { TestWrapper } from '../../test/TestWrapper';
import { TextInput } from 'react-native';

// Mock hooks
jest.mock('../../hooks/useUpdateProfile');
const mockedUseUpdateProfile = useUpdateProfile as jest.Mock;

jest.mock('../../store/hooks');
const mockedUseAppSelector = useAppSelector as jest.Mock;

// Mock navigation
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: mockSetOptions,
  }),
}));

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// Mock current user data from Redux
const mockCurrentUser = {
  _id: 'u1',
  id: 'u1',
  username: 'currentUser',
  displayName: 'Current Name',
  bio: 'Current Bio',
};

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled: boolean;
}

interface HeaderComponent {
  props: ButtonProps;
}

type HeaderOptionsType = {
  headerRight: () => HeaderComponent;
  headerLeft: () => HeaderComponent;
};

describe('ProfileEditScreen', () => {
  let mockMutate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockMutate = jest.fn();
    const mutationResult = {
      mutate: mockMutate,
      isPending: false,
      error: null,
    };
    mockedUseUpdateProfile.mockReturnValue(mutationResult);
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ auth: { user: mockCurrentUser } })
    );
  });

  it('pre-populates fields with current user data', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <ProfileEditScreen />
      </TestWrapper>
    );

    // Check that input fields have the correct initial values
    const displayNameInput = getByPlaceholderText('Display Name');
    const bioInput = getByPlaceholderText('Bio');

    // Type assertion for testing purposes since we know the structure
    const displayNameProps = displayNameInput.props as { value: string };
    const bioProps = bioInput.props as { value: string };

    expect(displayNameProps.value).toBe(mockCurrentUser.displayName);
    expect(bioProps.value).toBe(mockCurrentUser.bio);
  });

  it('disables Save button initially', async () => {
    render(
      <TestWrapper>
        <ProfileEditScreen />
      </TestWrapper>
    );

    // Verify that the last call to setOptions has a disabled Save button
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();

      // Safe index calculation
      const calls = mockSetOptions.mock.calls;
      const lastCallIndex = calls.length > 0 ? calls.length - 1 : 0;

      // Type assertion for the last call arguments
      const lastCallArgs = calls[lastCallIndex][0] as HeaderOptionsType;
      const headerRightComponent = lastCallArgs.headerRight();
      expect(headerRightComponent.props.disabled).toBe(true);
    });
  });

  it('enables Save button when data changes', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <ProfileEditScreen />
      </TestWrapper>
    );

    // Change the display name field
    const displayNameInput = getByPlaceholderText('Display Name');
    fireEvent.changeText(displayNameInput, 'New Display Name');

    // Verify the Save button becomes enabled
    await waitFor(() => {
      expect(mockSetOptions).toHaveBeenCalled();

      // Safe index calculation
      const calls = mockSetOptions.mock.calls;
      const lastCallIndex = calls.length > 0 ? calls.length - 1 : 0;

      // Type assertion for the last call arguments
      const lastCallArgs = calls[lastCallIndex][0] as HeaderOptionsType;
      const headerRightComponent = lastCallArgs.headerRight();
      expect(headerRightComponent.props.disabled).toBe(false);
    });
  });

  it('calls mutate with correct data when Save is pressed', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <ProfileEditScreen />
      </TestWrapper>
    );

    // Change the display name and bio
    const displayNameInput = getByPlaceholderText('Display Name');
    const bioInput = getByPlaceholderText('Bio');
    fireEvent.changeText(displayNameInput, 'New Display Name');
    fireEvent.changeText(bioInput, 'New Bio');

    // Wait for setOptions to be called with updated button
    let saveButtonProps: ButtonProps | undefined;

    await waitFor(() => {
      // Safe index calculation
      const calls = mockSetOptions.mock.calls;
      const lastCallIndex = calls.length > 0 ? calls.length - 1 : 0;

      // Type assertion for the last call arguments
      const lastCallArgs = calls[lastCallIndex][0] as HeaderOptionsType;
      const headerRightComponent = lastCallArgs.headerRight();
      saveButtonProps = headerRightComponent.props;
      expect(saveButtonProps.disabled).toBe(false);
    });

    // Press the Save button
    if (saveButtonProps && typeof saveButtonProps.onPress === 'function') {
      saveButtonProps.onPress();
    }

    // Verify mutate was called with the correct arguments
    expect(mockMutate).toHaveBeenCalledWith(
      {
        username: mockCurrentUser.username,
        data: {
          displayName: 'New Display Name',
          bio: 'New Bio',
        },
      },
      expect.any(Object)
    );
  });

  it('calls goBack when Cancel is pressed', async () => {
    render(
      <TestWrapper>
        <ProfileEditScreen />
      </TestWrapper>
    );

    // Wait for setOptions to be called with Cancel button
    let cancelButtonProps: ButtonProps | undefined;

    await waitFor(() => {
      // Safe index calculation
      const calls = mockSetOptions.mock.calls;
      const lastCallIndex = calls.length > 0 ? calls.length - 1 : 0;

      // Type assertion for the last call arguments
      const lastCallArgs = calls[lastCallIndex][0] as HeaderOptionsType;
      const headerLeftComponent = lastCallArgs.headerLeft();
      cancelButtonProps = headerLeftComponent.props;
    });

    // Press the Cancel button
    if (cancelButtonProps && typeof cancelButtonProps.onPress === 'function') {
      cancelButtonProps.onPress();
    }

    // Verify navigation.goBack was called
    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });
});
