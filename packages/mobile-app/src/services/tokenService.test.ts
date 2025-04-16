import AsyncStorage from '@react-native-async-storage/async-storage';
import tokenService from './tokenService';

// Mock AsyncStorage module
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('tokenService', () => {
  // Clear mock data before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token to AsyncStorage', async () => {
      const token = 'test-token';
      await tokenService.saveToken(token);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@fyp-saturn/auth-token',
        token
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should throw error when AsyncStorage fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(error);

      await expect(tokenService.saveToken('test-token')).rejects.toThrow(
        'Failed to save authentication token'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('getToken', () => {
    it('should return token from AsyncStorage', async () => {
      const token = 'stored-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(token);

      const result = await tokenService.getToken();

      expect(result).toBe(token);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        '@fyp-saturn/auth-token'
      );
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return null when token is not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await tokenService.getToken();

      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return null when AsyncStorage throws error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

      const result = await tokenService.getToken();

      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeToken', () => {
    it('should remove token from AsyncStorage', async () => {
      await tokenService.removeToken();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        '@fyp-saturn/auth-token'
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should throw error when AsyncStorage fails', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(error);

      await expect(tokenService.removeToken()).rejects.toThrow(
        'Failed to remove authentication token'
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    });
  });

  describe('hasToken', () => {
    it('should return true when valid token exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('valid-token');

      const result = await tokenService.hasToken();

      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return false when token is null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await tokenService.hasToken();

      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return false when token is empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('');

      const result = await tokenService.hasToken();

      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return false when AsyncStorage throws error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(error);

      const result = await tokenService.hasToken();

      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });
  });
});
