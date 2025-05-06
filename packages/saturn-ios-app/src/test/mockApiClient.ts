import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from '../config/api';

// Create a mock Axios instance that can be configured in tests
const mockApiClient = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set up response mocks for different endpoints
const mockResponses = {
  // Auth responses
  login: {
    token: 'valid-auth-token',
    user: {
      _id: 'userId123',
      id: 'userId123',
      username: 'testuser',
      displayName: 'Test User',
    },
  },
  register: {
    token: 'new-user-auth-token',
    user: {
      _id: 'newUserId123',
      id: 'newUserId123',
      username: 'newuser',
      displayName: 'New User',
    },
  },
  // Posts responses
  posts: {
    posts: [
      {
        _id: 'postId123',
        id: 'postId123',
        author: {
          _id: 'userId123',
          id: 'userId123',
          username: 'testuser',
          displayName: 'Test User Display Name',
          avatarUrl: 'http://example.com/avatar.jpg',
        },
        content: 'This is some post content',
        createdAt: '2025-01-01T12:00:00Z',
        likeCount: 10,
        commentCount: 5,
        isLiked: false,
      },
    ],
    hasMore: false,
  },
  // Profile response
  profile: {
    _id: 'userId123',
    id: 'userId123',
    username: 'testuser',
    displayName: 'Test User',
    bio: 'This is a test bio.',
    followersCount: 100,
    followingCount: 50,
    isFollowing: false,
  },
};

// Add a method to reset all mocks
export const resetMocks = (): void => {
  jest.clearAllMocks();
  (mockApiClient.get as jest.Mock).mockReset();
  (mockApiClient.post as jest.Mock).mockReset();
  (mockApiClient.put as jest.Mock).mockReset();
  (mockApiClient.delete as jest.Mock).mockReset();
};

// Set up default mock implementations that return the mockResponses
mockApiClient.get = jest.fn().mockImplementation((url) => {
  if (url.includes('/api/posts')) {
    return Promise.resolve({ data: mockResponses.posts });
  }
  if (url.includes('/api/actors/')) {
    return Promise.resolve({ data: mockResponses.profile });
  }
  return Promise.resolve({ data: {} });
});

mockApiClient.post = jest.fn().mockImplementation((url, data) => {
  if (url.includes('/api/auth/login')) {
    return Promise.resolve({ data: mockResponses.login });
  }
  if (url.includes('/api/auth/register')) {
    return Promise.resolve({ data: mockResponses.register });
  }
  if (url.includes('/api/posts')) {
    return Promise.resolve({
      data: {
        ...mockResponses.posts.posts[0],
        content: data.content,
        likeCount: 0,
        commentCount: 0,
      },
    });
  }
  return Promise.resolve({ data: {} });
});

mockApiClient.put = jest.fn();
mockApiClient.delete = jest.fn();

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
