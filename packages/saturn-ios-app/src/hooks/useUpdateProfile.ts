import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  updateUserProfile,
  UpdateProfilePayload,
} from '../services/profileService';
import { User } from '../types/user';
import { ApiError } from '../types/api';
import { PROFILE_QUERY_KEY } from './useUserProfile'; // Import profile query key

// USER_QUERY_KEY definition to match useCurrentUser.ts
const USER_QUERY_KEY = ['currentUser'];

interface UpdateProfileVariables {
  username: string;
  data: UpdateProfilePayload;
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateProfileVariables>({
    mutationFn: updateUserProfile,
    onSuccess: (updatedUser, variables) => {
      console.log('Profile updated successfully for:', variables.username);

      // Add void to fix floating promises
      void queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY(variables.username),
      });

      // Also invalidate the 'currentUser' query if the updated profile was the logged-in user's
      void queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });

      // Optional: Manually update the cache immediately for better UX
      // queryClient.setQueryData(PROFILE_QUERY_KEY(variables.username), updatedUser);

      console.log('Profile and CurrentUser queries invalidated.');
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
    },
  });
};
