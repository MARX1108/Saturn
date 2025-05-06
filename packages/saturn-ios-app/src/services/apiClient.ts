import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT, ApiEndpoints } from '../config/api';
import { ApiError } from '../types/api';
// Placeholder for token storage service
import * as tokenStorage from './tokenStorage';
// Import event emitter
import { eventEmitter, EventType } from './eventEmitter';

// Type for API error response data
interface ErrorResponseData {
  error?: string;
  message?: string;
  type?: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    // Add other default headers if needed (e.g., 'Accept')
  },
});

// Flag to track if token refresh is in progress
let isRefreshingToken = false;
// Queue of requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Adds a callback to the refresh queue
 */
const addRefreshSubscriber = (callback: (token: string) => void): void => {
  refreshSubscribers.push(callback);
};

/**
 * Executes all callbacks in the refresh queue with the new token
 */
const onTokenRefreshed = (newToken: string): void => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Refreshes the authentication token
 */
const refreshToken = async (): Promise<string | null> => {
  try {
    // Get stored credentials - you'll need to implement this
    // This is a placeholder - in a real app, you might use a refresh token or stored credentials
    const credentials = await tokenStorage.getStoredCredentials();

    if (!credentials) {
      console.log('No stored credentials for token refresh');
      return null;
    }

    // Create a new axios instance to avoid interceptors
    const refreshAxios = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
    });

    // Attempt to login again with stored credentials
    const response = await refreshAxios.post(ApiEndpoints.login, credentials);

    if (response.data?.token) {
      // Store the new token
      await tokenStorage.setToken(response.data.token);
      console.log('Token refreshed successfully');
      return response.data.token;
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
};

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    try {
      // --- Auth Token Logic ---
      // Retrieve the token from storage (e.g., AsyncStorage, SecureStore)
      const token = await tokenStorage.getToken(); // Replace with your actual token retrieval logic

      if (token && config.headers) {
        // Ensure headers object exists before assigning
        config.headers.Authorization = `Bearer ${token}`;
      }
      // You can add other request modifications here (e.g., logging)
      return config;
    } catch (error) {
      console.error('[API Client] Error setting auth token:', error);
      return config;
    }
  },
  (error: AxiosError): Promise<AxiosError> => {
    // Handle request setup errors
    console.error('[API Client] Request Error Interceptor:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  <T>(response: AxiosResponse<T>): T => {
    // --- Success Handling ---
    // If the response is successful, just return the data part
    // Adjust this based on your API's success response structure
    // If your API wraps data (e.g., { data: {...} }), return response.data.data
    // If it returns data directly, return response.data
    return response.data; // Assuming API returns data directly on success
  },
  async (error: AxiosError): Promise<never> => {
    // Get the original request configuration
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if the error is due to an expired token (401 status)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Mark the request as retried to prevent infinite loops
      originalRequest._retry = true;

      // If we're already refreshing the token, add this request to the queue
      if (isRefreshingToken) {
        // Return a new promise that will be resolved when the token is refreshed
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((token: string) => {
            // Update the Authorization header with the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            // Retry the original request with the new token
            resolve(axios(originalRequest));
          });
        });
      }

      // Start the token refresh process
      isRefreshingToken = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Notify all pending requests that the token has been refreshed
          onTokenRefreshed(newToken);

          // Retry the original request with the new token
          return axios(originalRequest);
        } else {
          // If token refresh fails, clear token and reject
          await tokenStorage.removeToken();
          console.error('[API Client] Token refresh failed');

          // Reset the refresh state
          isRefreshingToken = false;

          // Emit session expired event for app to handle
          eventEmitter.emit(EventType.SESSION_EXPIRED);
        }
      } catch (refreshError) {
        console.error('[API Client] Error refreshing token:', refreshError);

        // Emit session expired event for app to handle
        eventEmitter.emit(EventType.SESSION_EXPIRED);
      } finally {
        // Reset the refresh state
        isRefreshingToken = false;
      }
    }

    // --- Error Handling ---
    console.error(
      '[API Client] Response Error:',
      error.response?.status,
      error.response?.data || error.message
    );

    // Create a standardized error object with status code
    const apiError: ApiError = {
      status: error.response?.status || null,
      message: 'An unexpected error occurred. Please try again.', // Default message
      code: undefined,
      details: undefined,
      originalError: error,
    };

    // Try to parse specific error details from the backend response
    if (error.response && error.response.data) {
      const responseData = error.response.data as ErrorResponseData;

      if (responseData.error || responseData.message) {
        apiError.message =
          responseData.error || responseData.message || apiError.message;
      }

      if (responseData.type || responseData.code) {
        apiError.code = responseData.type || responseData.code;
      }

      if (responseData.details) {
        apiError.details = responseData.details;
      }
    } else if (error.request) {
      // The request was made but no response was received
      apiError.message = 'Network Error: Could not connect to the server.';
    } else {
      // Something happened in setting up the request that triggered an Error
      apiError.message = error.message || apiError.message;
    }

    // Create an error with additional properties - safeguard against undefined message
    const enhancedError = new Error(
      apiError.message || 'API Error'
    ) as Error & {
      status?: number | null;
      code?: string;
      details?: Record<string, unknown>;
    };

    // Add properties to the error
    enhancedError.status = apiError.status;
    enhancedError.code = apiError.code;
    enhancedError.details = apiError.details;

    // Reject with the enhanced error object
    return Promise.reject(enhancedError);
  }
);

// --- Wrapper Functions ---
// Optional: Provide simple wrappers for common methods if desired,
// although using apiClient.get<Type>(...) directly is also fine.

export const get = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string before using it
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  return apiClient.get<T, T>(url, config);
};

export const post = <T>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string before using it
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  return apiClient.post<T, T>(url, data, config);
};

export const put = <T>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string before using it
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  return apiClient.put<T, T>(url, data, config);
};

export const del = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string before using it
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  return apiClient.delete<T, T>(url, config);
};

// Example for form data if needed later
// export const postForm = <T>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<T> =>
//   apiClient.post<T, T>(url, formData, {
//     ...config,
//     headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
//   });

// Add explicit type augmentation for axios methods in this file
declare module 'axios' {
  export interface AxiosInstance {
    get<T = any, R = T>(
      url: string,
      config?: InternalAxiosRequestConfig
    ): Promise<R>;
    post<T = any, R = T>(
      url: string,
      data?: any,
      config?: InternalAxiosRequestConfig
    ): Promise<R>;
    put<T = any, R = T>(
      url: string,
      data?: any,
      config?: InternalAxiosRequestConfig
    ): Promise<R>;
    delete<T = any, R = T>(
      url: string,
      config?: InternalAxiosRequestConfig
    ): Promise<R>;
  }
}

export default apiClient; // Export the configured instance
