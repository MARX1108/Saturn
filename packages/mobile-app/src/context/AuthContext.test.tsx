import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { AuthProvider, useAuth } from './AuthContext';
import apiService from '../services/apiService';
import tokenService from '../services/tokenService';
import { User, LoginRequest, RegisterRequest } from '../types/api';

// Mock dependencies
jest.mock('../services/apiService');
jest.mock('../services/tokenService');
jest.mock('../config/appConfig', () => ({
  appConfig: {
    endpoints: {
      auth: {
        login: '/api/auth/login',
        register: '/api/auth/register',
        me: '/api/auth/me',
      },
    },
  },
}));

// Mock user data
const mockUser: User = {
  _id: '1',
  preferredUsername: 'testuser',
  name: 'Test User',
  bio: 'Test bio',
};

// Mock token
const mockToken = 'test-token';

// Mock API responses
const mockLoginResponse = {
  user: mockUser,
  token: mockToken,
};

const mockRegisterResponse = {
  actor: mockUser,
  token: mockToken,
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should load user from token on mount', async () => {
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce(mockToken);
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockUser);

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitForNextUpdate();

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle missing token on mount', async () => {
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce(null);

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle invalid token on mount', async () => {
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce(mockToken);
      (apiService.get as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid token')
      );

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await waitForNextUpdate();

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(tokenService.removeToken).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginCredentials: LoginRequest = {
      username: 'testuser',
      password: 'password123',
    };

    it('should login successfully', async () => {
      (apiService.post as jest.Mock).mockResolvedValueOnce(mockLoginResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.login(loginCredentials);
      });

      expect(apiService.post).toHaveBeenCalledWith(
        '/api/auth/login',
        loginCredentials
      );
      expect(tokenService.saveToken).toHaveBeenCalledWith(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const error = { message: 'Invalid credentials' };
      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        try {
          await result.current.login(loginCredentials);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('register', () => {
    const registerDetails: RegisterRequest = {
      username: 'newuser',
      password: 'password123',
      displayName: 'New User',
      bio: 'New bio',
    };

    it('should register successfully', async () => {
      (apiService.post as jest.Mock).mockResolvedValueOnce(
        mockRegisterResponse
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.register(registerDetails);
      });

      expect(apiService.post).toHaveBeenCalledWith('/api/auth/register', {
        username: registerDetails.username,
        password: registerDetails.password,
        displayName: registerDetails.displayName,
        bio: registerDetails.bio,
      });
      expect(tokenService.saveToken).toHaveBeenCalledWith(mockToken);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle registration failure', async () => {
      const error = { message: 'Username already exists' };
      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        try {
          await result.current.register(registerDetails);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Username already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(tokenService.removeToken).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle logout failure', async () => {
      (tokenService.removeToken as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.error).toBe('Failed to logout. Please try again.');
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      // Set an error
      await act(async () => {
        result.current
          .login({ username: 'test', password: 'test' })
          .catch(() => {});
      });

      expect(result.current.error).not.toBeNull();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.error).toEqual(
        new Error('useAuth must be used within an AuthProvider')
      );
    });
  });
});
