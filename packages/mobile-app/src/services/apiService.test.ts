import axios, { AxiosError, AxiosInstance } from 'axios';
import { appConfig } from '../config/appConfig';
import tokenService from './tokenService';
import apiService from './apiService';

// Mock modules
jest.mock('axios');
jest.mock('./tokenService');
jest.mock('../config/appConfig', () => ({
  appConfig: {
    apiBaseUrl: 'https://api.test.com',
  },
}));

describe('apiService', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    } as unknown as jest.Mocked<AxiosInstance>;

    (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
  });

  describe('axios instance configuration', () => {
    it('should create axios instance with correct config', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.test.com',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
    });
  });

  describe('request interceptor', () => {
    let requestInterceptor: any;

    beforeEach(() => {
      // Get the request interceptor function
      requestInterceptor =
        mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    });

    it('should add auth token to request headers when token exists', async () => {
      const token = 'test-token';
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce(token);
      const config = { headers: {} };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
      expect(tokenService.getToken).toHaveBeenCalled();
    });

    it('should not add auth token when token does not exist', async () => {
      (tokenService.getToken as jest.Mock).mockResolvedValueOnce(null);
      const config = { headers: {} };

      const result = await requestInterceptor(config);

      expect(result.headers.Authorization).toBeUndefined();
      expect(tokenService.getToken).toHaveBeenCalled();
    });
  });

  describe('response interceptor', () => {
    let responseErrorInterceptor: any;

    beforeEach(() => {
      // Get the response error interceptor function
      responseErrorInterceptor =
        mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
    });

    it('should format error response correctly', async () => {
      const axiosError: AxiosError = {
        response: {
          status: 400,
          data: {
            message: 'Bad Request',
            data: { field: 'error' },
          },
        },
      } as AxiosError;

      try {
        await responseErrorInterceptor(axiosError);
      } catch (error: any) {
        expect(error).toEqual({
          status: 400,
          message: 'Bad Request',
          data: { field: 'error' },
        });
      }
    });

    it('should handle error without response', async () => {
      const axiosError: AxiosError = {
        message: 'Network Error',
      } as AxiosError;

      try {
        await responseErrorInterceptor(axiosError);
      } catch (error: any) {
        expect(error).toEqual({
          status: 500,
          message: 'Network Error',
          data: null,
        });
      }
    });
  });

  describe('HTTP methods', () => {
    const mockResponse = { data: { id: 1, name: 'Test' } };
    const mockError = new Error('API Error');

    describe('get', () => {
      it('should make GET request and return data', async () => {
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

        const result = await apiService.get('/test');

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      });

      it('should make GET request with config', async () => {
        const config = { params: { id: 1 } };
        mockAxiosInstance.get.mockResolvedValueOnce(mockResponse);

        await apiService.get('/test', config);

        expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', config);
      });

      it('should throw error on failed request', async () => {
        mockAxiosInstance.get.mockRejectedValueOnce(mockError);

        await expect(apiService.get('/test')).rejects.toThrow('API Error');
      });
    });

    describe('post', () => {
      const data = { name: 'Test' };

      it('should make POST request and return data', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        const result = await apiService.post('/test', data);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/test',
          data,
          undefined
        );
      });

      it('should make POST request with config', async () => {
        const config = { headers: { 'Custom-Header': 'value' } };
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        await apiService.post('/test', data, config);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/test',
          data,
          config
        );
      });

      it('should throw error on failed request', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(mockError);

        await expect(apiService.post('/test', data)).rejects.toThrow(
          'API Error'
        );
      });
    });

    describe('postForm', () => {
      const formData = new FormData();

      it('should make POST request with FormData and correct headers', async () => {
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        const result = await apiService.postForm('/test', formData);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });

      it('should merge custom config with form headers', async () => {
        const config = { headers: { 'Custom-Header': 'value' } };
        mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

        await apiService.postForm('/test', formData, config);

        expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', formData, {
          ...config,
          headers: {
            'Custom-Header': 'value',
            'Content-Type': 'multipart/form-data',
          },
        });
      });
    });

    describe('put', () => {
      const data = { name: 'Test' };

      it('should make PUT request and return data', async () => {
        mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

        const result = await apiService.put('/test', data);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          '/test',
          data,
          undefined
        );
      });

      it('should make PUT request with config', async () => {
        const config = { headers: { 'Custom-Header': 'value' } };
        mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

        await apiService.put('/test', data, config);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith(
          '/test',
          data,
          config
        );
      });
    });

    describe('putForm', () => {
      const formData = new FormData();

      it('should make PUT request with FormData and correct headers', async () => {
        mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

        const result = await apiService.putForm('/test', formData);

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });

      it('should merge custom config with form headers', async () => {
        const config = { headers: { 'Custom-Header': 'value' } };
        mockAxiosInstance.put.mockResolvedValueOnce(mockResponse);

        await apiService.putForm('/test', formData, config);

        expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', formData, {
          ...config,
          headers: {
            'Custom-Header': 'value',
            'Content-Type': 'multipart/form-data',
          },
        });
      });
    });

    describe('delete', () => {
      it('should make DELETE request and return data', async () => {
        mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

        const result = await apiService.delete('/test');

        expect(result).toEqual(mockResponse.data);
        expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
          '/test',
          undefined
        );
      });

      it('should make DELETE request with config', async () => {
        const config = { params: { id: 1 } };
        mockAxiosInstance.delete.mockResolvedValueOnce(mockResponse);

        await apiService.delete('/test', config);

        expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', config);
      });

      it('should throw error on failed request', async () => {
        mockAxiosInstance.delete.mockRejectedValueOnce(mockError);

        await expect(apiService.delete('/test')).rejects.toThrow('API Error');
      });
    });
  });
});
