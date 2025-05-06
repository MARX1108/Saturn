/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import apiClient from './apiClient';
import { ApiEndpoints } from '../config/api';
import {
  setToken,
  removeToken,
  storeCredentials,
  clearAuthData,
} from './tokenStorage';

// Types for authentication
export interface User {
  id: string;
  _id: string;
  username: string;
  displayName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean; // Optional flag to determine if credentials should be stored
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  displayName?: string;
  rememberMe?: boolean; // Optional flag to determine if credentials should be stored
}

/**
 * Login a user with username and password
 */
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  if (!credentials.username || !credentials.password) {
    throw new Error('Username and password are required');
  }

  try {
    const { data: response } = await apiClient.post(
      ApiEndpoints.login,
      credentials
    );

    let authResponse: AuthResponse;

    if (response?.data) {
      // Handle case where response is wrapped in a data property (for tests)
      if (response.data.token && response.data.user) {
        await setToken(response.data.token);
        authResponse = response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } else if (response?.token && response?.user) {
      // Store the token for future authenticated requests
      await setToken(response.token);
      authResponse = response;
    } else {
      throw new Error('Invalid response from server');
    }

    // Store credentials if rememberMe is true
    if (credentials.rememberMe) {
      await storeCredentials({
        username: credentials.username,
        password: credentials.password,
      });
      console.log('[AuthService] Credentials stored for token refresh');
    }

    return authResponse;
  } catch (error) {
    console.error(
      'Login error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};

/**
 * Register a new user
 */
export const register = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  if (!userData.username || !userData.password || !userData.email) {
    throw new Error('Username, password, and email are required');
  }

  try {
    const { data: response } = await apiClient.post(
      ApiEndpoints.register,
      userData
    );

    let authResponse: AuthResponse;

    if (response?.data) {
      // Handle case where response is wrapped in a data property (for tests)
      if (response.data.token && response.data.user) {
        await setToken(response.data.token);
        authResponse = response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
    } else if (response?.token && response?.user) {
      // Store the token for future authenticated requests
      await setToken(response.token);
      authResponse = response;
    } else {
      throw new Error('Invalid response from server');
    }

    // Store credentials if rememberMe is true
    if (userData.rememberMe) {
      await storeCredentials({
        username: userData.username,
        password: userData.password,
      });
      console.log('[AuthService] Credentials stored for token refresh');
    }

    return authResponse;
  } catch (error) {
    console.error(
      'Registration error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Clear all auth data including token and credentials
    await clearAuthData();
  } catch (error) {
    console.error(
      'Logout error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};
