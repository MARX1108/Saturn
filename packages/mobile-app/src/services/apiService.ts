import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appConfig } from '../config/appConfig';
import tokenService from './tokenService';
import { ApiError } from '../types/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async config => {
    const token = await tokenService.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const errorResponse: ApiError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred',
      data: error.response?.data || null,
    };

    return Promise.reject(errorResponse);
  }
);

/**
 * API Service for handling HTTP requests
 */
export const apiService = {
  /**
   * Make a GET request
   * @param url - The endpoint URL (will be appended to the base URL)
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a POST request
   * @param url - The endpoint URL (will be appended to the base URL)
   * @param data - The data to send in the request body
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.post(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a multipart form POST request
   * @param url - The endpoint URL
   * @param formData - FormData object to send
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  postForm: async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const formConfig = {
        ...config,
        headers: {
          ...(config?.headers || {}),
          'Content-Type': 'multipart/form-data',
        },
      };
      const response: AxiosResponse<T> = await apiClient.post(
        url,
        formData,
        formConfig
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a PUT request
   * @param url - The endpoint URL (will be appended to the base URL)
   * @param data - The data to send in the request body
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a multipart form PUT request
   * @param url - The endpoint URL
   * @param formData - FormData object to send
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  putForm: async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const formConfig = {
        ...config,
        headers: {
          ...(config?.headers || {}),
          'Content-Type': 'multipart/form-data',
        },
      };
      const response: AxiosResponse<T> = await apiClient.put(
        url,
        formData,
        formConfig
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a DELETE request
   * @param url - The endpoint URL (will be appended to the base URL)
   * @param config - Optional axios request config
   * @returns Promise with the response data
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response: AxiosResponse<T> = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default apiService;
