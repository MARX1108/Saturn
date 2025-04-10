import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, LoginRequest, RegisterRequest, ApiError } from '../types/api';
import apiService from '../services/apiService';
import tokenService from '../services/tokenService';
import appConfig from '../config/appConfig';

// Define the shape of the auth context state
interface AuthContextState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (details: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUserFromToken: () => Promise<void>;
  clearError: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear any error messages
  const clearError = () => setError(null);

  // Load user data from token when app initializes
  useEffect(() => {
    loadUserFromToken();
  }, []);

  // Fetch user profile with the stored token
  const loadUserFromToken = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const savedToken = await tokenService.getToken();

      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      setToken(savedToken);

      // Fetch current user profile with the token
      const userData = await apiService.get<User>(appConfig.endpoints.auth.me);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Failed to load user from token:', error);
      // Clear invalid token
      await tokenService.removeToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    clearError();

    try {
      const response = await apiService.post(
        appConfig.endpoints.auth.login,
        credentials
      );

      const { user: userData, token: authToken } = response;

      // Save token and update state
      await tokenService.saveToken(authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register new user
  const register = async (details: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    clearError();

    try {
      // Ensure we're sending the correct field names as expected by the backend API
      // Backend expects: username, password, displayName, bio
      const payload = {
        username: details.username,
        password: details.password,
        displayName: details.displayName || details.name, // Fallback in case name is used
        bio: details.bio || '',
      };

      console.log('Registration payload:', payload);
      const response = await apiService.post(
        appConfig.endpoints.auth.register,
        payload
      );

      const { actor: userData, token: authToken } = response;

      // Save token and update state
      await tokenService.saveToken(authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Remove token from storage
      await tokenService.removeToken();

      // Reset auth state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the auth context to children components
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        loadUserFromToken,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
