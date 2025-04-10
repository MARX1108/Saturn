import AsyncStorage from '@react-native-async-storage/async-storage';
import tokenService from '../tokenService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Storage key used by the service
const AUTH_TOKEN_KEY = '@fyp-saturn/auth-token';

describe('tokenService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token to AsyncStorage with the correct key', async () => {
      // Arrange
      const testToken = 'test-jwt-token';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      await tokenService.saveToken(testToken);

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        AUTH_TOKEN_KEY,
        testToken
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when AsyncStorage fails', async () => {
      // Arrange
      const testToken = 'test-jwt-token';
      const mockError = new Error('AsyncStorage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(tokenService.saveToken(testToken)).rejects.toThrow(
        'Failed to save authentication token'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        AUTH_TOKEN_KEY,
        testToken
      );
    });
  });

  describe('getToken', () => {
    it('should return token from AsyncStorage when it exists', async () => {
      // Arrange
      const testToken = 'test-jwt-token';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(testToken);

      // Act
      const result = await tokenService.getToken();

      // Assert
      expect(result).toBe(testToken);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return null when token does not exist', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await tokenService.getToken();

      // Assert
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });

    it('should return null when AsyncStorage fails', async () => {
      // Arrange
      const mockError = new Error('AsyncStorage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(mockError);

      // Act
      const result = await tokenService.getToken();

      // Assert
      expect(result).toBeNull();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });
  });

  describe('removeToken', () => {
    it('should remove token from AsyncStorage with the correct key', async () => {
      // Arrange
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      // Act
      await tokenService.removeToken();

      // Assert
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when AsyncStorage fails', async () => {
      // Arrange
      const mockError = new Error('AsyncStorage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(tokenService.removeToken()).rejects.toThrow(
        'Failed to remove authentication token'
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });
  });

  describe('hasToken', () => {
    it('should return true when a valid token exists', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-token');

      // Act
      const result = await tokenService.hasToken();

      // Assert
      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });

    it('should return false when token is null', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await tokenService.hasToken();

      // Assert
      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });

    it('should return false when token is an empty string', async () => {
      // Arrange
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');

      // Act
      const result = await tokenService.hasToken();

      // Assert
      expect(result).toBe(false);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    });
  });
});
