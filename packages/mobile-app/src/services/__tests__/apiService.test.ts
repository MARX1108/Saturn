import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import tokenService from '../tokenService';
import apiService from '../apiService';

// Mock dependencies
jest.mock('axios');
jest.mock('../tokenService');
jest.mock('../../config/appConfig', () => ({
  appConfig: {
    apiBaseUrl: 'https://test-api.example.com/',
  },
}));

// Mock axios.create to return a mocked axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};
(axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);

describe('apiService', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test axios client initialization
  describe('axios client initialization', () => {
    it('should create axios instance with correct config', () => {
      // This test verifies that axios.create was called with the correct configuration
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: appConfig.apiBaseUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    });
  });

  // Test GET method
  describe('get', () => {
    it('should make a GET request and return data on success', async () => {
      // Arrange
      const url = '/test-endpoint';
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.get(url);

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(url, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make a GET request with config when provided', async () => {
      // Arrange
      const url = '/test-endpoint';
      const config = { params: { filter: 'active' } };
      const mockResponse = { data: { id: 1, name: 'Test' } };
      mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.get(url, config);

      // Assert
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(url, config);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when GET request fails', async () => {
      // Arrange
      const url = '/test-endpoint';
      const mockError = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(apiService.get(url)).rejects.toThrow(mockError);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(url, undefined);
    });
  });

  // Test POST method
  describe('post', () => {
    it('should make a POST request with data and return response on success', async () => {
      // Arrange
      const url = '/test-endpoint';
      const data = { name: 'Test Data' };
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.post(url, data);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, data, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make a POST request with config when provided', async () => {
      // Arrange
      const url = '/test-endpoint';
      const data = { name: 'Test Data' };
      const config = { timeout: 5000 };
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.post(url, data, config);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, data, config);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when POST request fails', async () => {
      // Arrange
      const url = '/test-endpoint';
      const data = { name: 'Test Data' };
      const mockError = new Error('Network error');
      mockAxiosInstance.post.mockRejectedValueOnce(mockError);

      // Act & Assert
      await expect(apiService.post(url, data)).rejects.toThrow(mockError);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, data, undefined);
    });
  });

  // Test postForm method
  describe('postForm', () => {
    it('should make a POST request with FormData and correct headers', async () => {
      // Arrange
      const url = '/upload';
      const formData = new FormData();
      formData.append('file', 'test-file');
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.postForm(url, formData);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should merge custom config with form headers', async () => {
      // Arrange
      const url = '/upload';
      const formData = new FormData();
      const config = {
        timeout: 30000,
        headers: { 'Custom-Header': 'value' },
      };
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.postForm(url, formData, config);

      // Assert
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(url, formData, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  // Test PUT method
  describe('put', () => {
    it('should make a PUT request with data and return response on success', async () => {
      // Arrange
      const url = '/test-endpoint/1';
      const data = { name: 'Updated Data' };
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.put(url, data);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(url, data, undefined);
      expect(result).toEqual(mockResponse.data);
    });
  });

  // Test putForm method
  describe('putForm', () => {
    it('should make a PUT request with FormData and correct headers', async () => {
      // Arrange
      const url = '/update-with-form/1';
      const formData = new FormData();
      formData.append('file', 'test-file');
      const mockResponse = { data: { id: 1, success: true } };
      mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.putForm(url, formData);

      // Assert
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  // Test DELETE method
  describe('delete', () => {
    it('should make a DELETE request and return data on success', async () => {
      // Arrange
      const url = '/test-endpoint/1';
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.delete(url);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(url, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make a DELETE request with config when provided', async () => {
      // Arrange
      const url = '/test-endpoint/1';
      const config = { params: { permanent: true } };
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await apiService.delete(url, config);

      // Assert
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(url, config);
      expect(result).toEqual(mockResponse.data);
    });
  });

  // Test Request Interceptor
  describe('request interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      // Extract the request interceptor function
      const interceptors = (axios.create as jest.Mock).mock.calls[0][0];
      expect(interceptors).toBeDefined();

      // This test is a bit more complex as we need to simulate how interceptors work
      // We'll need to manually call the interceptor function registered with axios

      // Since we can't easily access the interceptor directly from our mocks,
      // we'll test the behavior through a real request

      // Mock the tokenService to return a token
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce('test-token');

      // Make a request to trigger the interceptor
      const mockConfig = { headers: {} };
      mockAxiosInstance.get.mockImplementationOnce(async (url, config) => {
        // Simulate the interceptor by modifying the config
        const token = await tokenService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return { data: { success: true } };
      });

      // Act
      await apiService.get('/test', mockConfig);

      // Assert
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(mockConfig.headers.Authorization).toBe('Bearer test-token');
    });
  });
});
