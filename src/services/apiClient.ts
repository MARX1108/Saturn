import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { ApiError } from '../types/api';
// Placeholder for token storage service
import { getToken } from './tokenStorage';

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
  async (config: InternalAxiosRequestConfig) => {
    // --- Auth Token Logic ---
    // Retrieve the token from storage (e.g., AsyncStorage, SecureStore)
    const token = await getToken(); // Replace with your actual token retrieval logic

    if (token && config.headers) {
      // Ensure headers object exists before assigning
      config.headers.Authorization = `Bearer ${token}`;
    }
    // You can add other request modifications here (e.g., logging)
    return config;
  },
  (error: AxiosError) => {
    // Handle request setup errors
    console.error('[API Client] Request Error Interceptor:', error);
    return Promise.reject(error);
  }
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // --- Success Handling ---
    // If the response is successful, just return the data part
    // Adjust this based on your API's success response structure
    // If your API wraps data (e.g., { data: {...} }), return response.data.data
    // If it returns data directly, return response.data
    return response.data; // Assuming API returns data directly on success
  },
  (error: AxiosError) => {
    // --- Error Handling ---
    console.error(
      '[API Client] Response Error Interceptor:',
      error.response?.data || error.message
    );

    const apiError: ApiError = {
      status: error.response?.status || null,
      message: 'An unexpected error occurred. Please try again.', // Default message
      code: undefined,
      details: undefined,
      originalError: error,
    };

    // Try to parse specific error details from the backend response
    if (error.response && error.response.data) {
      const responseData = error.response.data as any; // Type assertion, use carefully
      apiError.message =
        responseData.error || responseData.message || apiError.message;
      apiError.code = responseData.type || responseData.code; // Use 'type' or 'code' if backend provides it
      apiError.details = responseData.details; // Include validation details if present
    } else if (error.request) {
      // The request was made but no response was received
      apiError.message = 'Network Error: Could not connect to the server.';
    } else {
      // Something happened in setting up the request that triggered an Error
      apiError.message = error.message || apiError.message;
    }

    // Specific error handling (e.g., for 401 Unauthorized for token refresh - TO BE ADDED LATER)
    // if (apiError.status === 401) {
    //   // Handle token refresh logic here or trigger logout
    // }

    // Reject with the standardized ApiError object
    return Promise.reject(apiError);
  }
);

// --- Wrapper Functions ---
// Optional: Provide simple wrappers for common methods if desired,
// although using apiClient.get<Type>(...) directly is also fine.

export const get = <T = any>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.get<T>(url, config);

export const post = <T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.post<T>(url, data, config);

export const put = <T = any>(
  url: string,
  data?: any,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.put<T>(url, data, config);

export const del = <T = any>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => apiClient.delete<T>(url, config);

// Example for form data if needed later
// export const postForm = <T = any>(url: string, formData: FormData, config?: InternalAxiosRequestConfig): Promise<T> =>
//   apiClient.post<T>(url, formData, {
//     ...config,
//     headers: { ...config?.headers, 'Content-Type': 'multipart/form-data' },
//   });

export default apiClient; // Export the configured instance
