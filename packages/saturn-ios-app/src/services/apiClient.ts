import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { ApiError } from '../types/api';
// Placeholder for token storage service
import * as tokenStorage from './tokenStorage';

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
  (error: AxiosError): Promise<never> => {
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

    // Create an error with additional properties
    const enhancedError = new Error(apiError.message) as Error & {
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
): Promise<T> => apiClient.get<T, T>(url, config);

export const post = <T>(
  url: string,
  data?: Record<string, unknown>,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.post<T, T>(url, data, config);

export const put = <T>(
  url: string,
  data?: Record<string, unknown>,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.put<T, T>(url, data, config);

export const del = <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.delete<T, T>(url, config);

// Example for form data if needed later
// export const postForm = <T>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<T> =>
//   apiClient.post<T, T>(url, formData, {
//     ...config,
//     headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
//   });

export default apiClient; // Export the configured instance
