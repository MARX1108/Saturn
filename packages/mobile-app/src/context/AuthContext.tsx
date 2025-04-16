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
import Toast from 'react-native-toast-message';

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

interface RegisterRequest {
  username: string;
  email: string;
  displayName?: string;
  password: string;
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

      // Ensure we have both user data and token
      if (!response.token) {
        throw new Error('No token received from server');
      }

      const { actor: userData, token: authToken } = response;

      // Validate token format
      if (typeof authToken !== 'string' || !authToken.trim()) {
        throw new Error('Invalid token format received');
      }

      // Save token and update state
      await tokenService.saveToken(authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.status === 401
          ? 'Incorrect username or password.'
          : apiError.message || 'Login failed. Please try again.';

      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
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
      const payload = {
        username: details.username,
        email: details.email,
        password: details.password,
        displayName: details.displayName || details.username,
      };

      const response = await apiService.post(
        appConfig.endpoints.auth.register,
        payload
      );

      // Ensure we have both actor data and token
      if (!response.token) {
        throw new Error('No token received from server');
      }

      const { actor: userData, token: authToken } = response;

      // Validate token format
      if (typeof authToken !== 'string' || !authToken.trim()) {
        throw new Error('Invalid token format received');
      }

      // Save token and update state
      await tokenService.saveToken(authToken);
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      const apiError = error as ApiError;
      const errorMessage =
        apiError.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
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
      const errorMessage = 'Failed to logout. Please try again.';
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: errorMessage,
      });
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
