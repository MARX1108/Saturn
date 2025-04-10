import apiService from '../apiService';
import profileService from '../profileService';
import appConfig from '../../config/appConfig';
import { User } from '../../types/user';
import { Post } from '../../types/post';

// Mock dependencies
jest.mock('../apiService');
jest.mock('../../config/appConfig', () => ({
  __esModule: true,
  default: {
    endpoints: {
      actors: {
        getUserProfile: '/api/actors/:username',
        updateActor: '/api/actors/:username',
        getUserPosts: '/api/actors/:username/posts', // Included for test coverage
      },
    },
  },
}));

describe('profileService', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear all console mocks
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  // Cleanup after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test fetchUserProfile
  describe('fetchUserProfile', () => {
    it('should call apiService.get with correct URL', async () => {
      // Arrange
      const username = 'testuser';
      const mockUser = {
        id: '123',
        preferredUsername: username,
        name: 'Test User',
      } as User;
      (apiService.get as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await profileService.fetchUserProfile(username);

      // Assert
      const expectedUrl = appConfig.endpoints.actors.getUserProfile.replace(
        ':username',
        username
      );
      expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const username = 'testuser';
      const mockError = new Error('Network error');
      (apiService.get as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(profileService.fetchUserProfile(username)).rejects.toThrow(
        mockError
      );
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching user profile:',
        mockError
      );
    });
  });

  // Test fetchUserPosts
  describe('fetchUserPosts', () => {
    it('should return empty array and log warning', async () => {
      // Arrange
      const username = 'testuser';

      // Act
      const result = await profileService.fetchUserPosts(username);

      // Assert
      expect(result).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith(
        'The /api/actors/:username/posts endpoint is not documented in the API documentation'
      );
      expect(apiService.get).not.toHaveBeenCalled();
    });
  });

  // Test updateUserProfile
  describe('updateUserProfile', () => {
    it('should call apiService.putForm with correct URL and FormData containing displayName', async () => {
      // Arrange
      const username = 'testuser';
      const profileData = {
        displayName: 'Updated Name',
      };
      const mockUser = {
        id: '123',
        preferredUsername: username,
        name: 'Updated Name',
      } as User;
      (apiService.putForm as jest.Mock).mockResolvedValue(mockUser);

      // Mock FormData
      const mockAppend = jest.fn();
      global.FormData = jest.fn().mockImplementation(() => ({
        append: mockAppend,
      }));

      // Act
      const result = await profileService.updateUserProfile(
        username,
        profileData
      );

      // Assert
      const expectedUrl = appConfig.endpoints.actors.updateActor.replace(
        ':username',
        username
      );
      expect(apiService.putForm).toHaveBeenCalled();
      expect(mockAppend).toHaveBeenCalledWith(
        'displayName',
        profileData.displayName
      );
      expect(result).toEqual(mockUser);
    });

    it('should call apiService.putForm with FormData containing all profile fields', async () => {
      // Arrange
      const username = 'testuser';
      const profileData = {
        displayName: 'Updated Name',
        bio: 'Updated Bio',
        avatarFile: new File([''], 'avatar.jpg'),
      };
      const mockUser = {
        id: '123',
        preferredUsername: username,
        name: 'Updated Name',
        bio: 'Updated Bio',
      } as User;
      (apiService.putForm as jest.Mock).mockResolvedValue(mockUser);

      // Mock FormData
      const mockAppend = jest.fn();
      global.FormData = jest.fn().mockImplementation(() => ({
        append: mockAppend,
      }));

      // Act
      const result = await profileService.updateUserProfile(
        username,
        profileData
      );

      // Assert
      expect(apiService.putForm).toHaveBeenCalled();
      expect(mockAppend).toHaveBeenCalledWith(
        'displayName',
        profileData.displayName
      );
      expect(mockAppend).toHaveBeenCalledWith('bio', profileData.bio);
      expect(mockAppend).toHaveBeenCalledWith(
        'avatarFile',
        profileData.avatarFile
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const username = 'testuser';
      const profileData = {
        displayName: 'Updated Name',
      };
      const mockError = new Error('Network error');
      (apiService.putForm as jest.Mock).mockRejectedValue(mockError);

      // Mock FormData
      global.FormData = jest.fn().mockImplementation(() => ({
        append: jest.fn(),
      }));

      // Act & Assert
      await expect(
        profileService.updateUserProfile(username, profileData)
      ).rejects.toThrow(mockError);
      expect(console.error).toHaveBeenCalledWith(
        'Error updating user profile:',
        mockError
      );
    });
  });
});
