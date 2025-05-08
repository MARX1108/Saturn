import { renderHook, act } from '@testing-library/react-hooks';
import { useUpdateProfile } from './useUpdateProfile';
import { updateUserProfile } from '../services/profileService';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the profileService
jest.mock('../services/profileService', () => ({
  updateUserProfile: jest.fn(),
}));

// Mock the queryClient invalidation methods
const mockInvalidateQueries = jest.fn();

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
jest.mock('@tanstack/react-query', () => {
  const actualReactQuery = jest.requireActual('@tanstack/react-query');
  return {
    ...actualReactQuery,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});
/* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */

describe('useUpdateProfile', () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call updateUserProfile service and invalidate queries on success', async () => {
    // Mock successful profile update
    const mockUpdateData = {
      username: 'testuser',
      data: {
        displayName: 'Test User Updated',
        bio: 'Updated bio',
      },
    };
    const mockResponse = {
      _id: 'userId123',
      id: 'userId123',
      username: 'testuser',
      displayName: 'Test User Updated',
      bio: 'Updated bio',
    };
    (updateUserProfile as jest.Mock).mockResolvedValueOnce(mockResponse);

    // Render the hook
    const { result, waitFor } = renderHook(() => useUpdateProfile(), {
      wrapper,
    });

    // Act - call the mutation function
    act(() => {
      result.current.mutate(mockUpdateData);
    });

    // Wait for mutation to complete
    await waitFor(() => result.current.isSuccess);

    // Assert that the service was called with correct parameters
    expect(updateUserProfile).toHaveBeenCalledWith(mockUpdateData);

    // Assert that the cache was invalidated
    expect(mockInvalidateQueries).toHaveBeenCalledTimes(2);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['userProfile', 'testuser'],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['currentUser'],
    });
  });

  it('should handle errors properly', async () => {
    // Mock error case
    const error = new Error('Failed to update profile');
    (updateUserProfile as jest.Mock).mockRejectedValueOnce(error);

    // Render the hook
    const { result, waitFor } = renderHook(() => useUpdateProfile(), {
      wrapper,
    });

    // Act - call the mutation function
    act(() => {
      result.current.mutate({
        username: 'testuser',
        data: { displayName: 'Test User' },
      });
    });

    // Wait for mutation to complete with error
    await waitFor(() => result.current.isError);

    // Assert the error is captured
    expect(result.current.error).toEqual(error);

    // Assert that cache invalidation was not called on error
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
