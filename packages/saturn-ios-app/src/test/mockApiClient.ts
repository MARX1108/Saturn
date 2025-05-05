import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from '../config/api';

// Create a special mock Axios instance for testing
const mockApiClient = axios.create({
  // No baseURL for tests - we'll set it per test
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export methods that don't rely on URL building
export const get = async <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  const response: AxiosResponse<T> = await mockApiClient.get(url, config);
  return response.data;
};

export const post = async <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  const response: AxiosResponse<T> = await mockApiClient.post(
    url,
    data,
    config
  );
  return response.data;
};

export const put = async <T>(
  url: string,
  data?: unknown,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  const response: AxiosResponse<T> = await mockApiClient.put(url, data, config);
  return response.data;
};

export const del = async <T>(
  url: string,
  config?: InternalAxiosRequestConfig
): Promise<T> => {
  // Ensure url is a string
  if (typeof url !== 'string') {
    throw new Error('URL must be a string');
  }
  const response: AxiosResponse<T> = await mockApiClient.delete(url, config);
  return response.data;
};

export default mockApiClient;
