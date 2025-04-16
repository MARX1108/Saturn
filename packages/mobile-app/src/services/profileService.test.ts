import apiService from './apiService';
import profileService from './profileService';
import { User } from '../types/user';
import { Post } from '../types/post';

// Mock dependencies
jest.mock('./apiService');
jest.mock('../config/appConfig', () => ({
  appConfig: {
    endpoints: {
      actors: {
        searchActors: '/api/actors/search',
        getUserProfile: '/api/actors/:username',
        getUserPosts: '/api/actors/:username/posts',
        updateActor: '/api/actors/:username',
      },
    },
  },
}));

describe('profileService', () => {
  const mockUser: User = {
    _id: '1',
    preferredUsername: 'testuser',
    name: 'Test User',
    bio: 'Test bio',
  };

  const mockPost: Post = {
    _id: '1',
    content: 'Test post',
    author: mockUser,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    likedByUser: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchActors', () => {
    it('should search for users with query', async () => {
      const mockUsers = [mockUser];
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockUsers);

      const result = await profileService.searchActors('test');

      expect(apiService.get).toHaveBeenCalledWith('/api/actors/search', {
        params: { q: 'test' },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should handle search error', async () => {
      const error = new Error('Search failed');
      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(profileService.searchActors('test')).rejects.toThrow(
        'Search failed'
      );
    });
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile by username', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await profileService.fetchUserProfile('testuser');

      expect(apiService.get).toHaveBeenCalledWith('/api/actors/testuser');
      expect(result).toEqual(mockUser);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Profile not found');
      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(profileService.fetchUserProfile('testuser')).rejects.toThrow(
        'Profile not found'
      );
    });
  });

  describe('fetchUserPosts', () => {
    const mockResponse = {
      posts: [mockPost],
      hasMore: false,
      totalCount: 1,
    };

    it('should fetch user posts with default pagination', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await profileService.fetchUserPosts('testuser');

      expect(apiService.get).toHaveBeenCalledWith(
        '/api/actors/testuser/posts',
        {
          params: { page: 1, limit: 20 },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should fetch user posts with custom pagination', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await profileService.fetchUserPosts('testuser', 2, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        '/api/actors/testuser/posts',
        {
          params: { page: 2, limit: 10 },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty response', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce({});

      const result = await profileService.fetchUserPosts('testuser');

      expect(result).toEqual({
        posts: [],
        hasMore: false,
        totalCount: undefined,
      });
    });

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch posts');
      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(profileService.fetchUserPosts('testuser')).rejects.toThrow(
        'Failed to fetch posts'
      );
    });
  });

  describe('updateUserProfile', () => {
    const username = 'testuser';
    const profileData = {
      displayName: 'Updated Name',
      bio: 'Updated bio',
    };

    it('should update profile without avatar', async () => {
      (apiService.putForm as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await profileService.updateUserProfile(
        username,
        profileData
      );

      expect(apiService.putForm).toHaveBeenCalledWith(
        '/api/actors/testuser',
        expect.any(FormData)
      );

      // Verify FormData contents
      const formData: FormData = (apiService.putForm as jest.Mock).mock
        .calls[0][1];
      expect(formData.get('displayName')).toBe(profileData.displayName);
      expect(formData.get('bio')).toBe(profileData.bio);
      expect(result).toEqual(mockUser);
    });

    it('should update profile with avatar', async () => {
      const avatarFile = new File([''], 'avatar.jpg', { type: 'image/jpeg' });
      const updatedProfileData = { ...profileData, avatarFile };

      (apiService.putForm as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await profileService.updateUserProfile(
        username,
        updatedProfileData
      );

      expect(apiService.putForm).toHaveBeenCalledWith(
        '/api/actors/testuser',
        expect.any(FormData)
      );

      // Verify FormData contents
      const formData: FormData = (apiService.putForm as jest.Mock).mock
        .calls[0][1];
      expect(formData.get('displayName')).toBe(profileData.displayName);
      expect(formData.get('bio')).toBe(profileData.bio);
      expect(formData.get('avatarFile')).toBe(avatarFile);
      expect(result).toEqual(mockUser);
    });

    it('should handle update error', async () => {
      const error = new Error('Failed to update profile');
      (apiService.putForm as jest.Mock).mockRejectedValueOnce(error);

      await expect(
        profileService.updateUserProfile(username, profileData)
      ).rejects.toThrow('Failed to update profile');
    });
  });
});
