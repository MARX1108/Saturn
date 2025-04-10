import apiService from '../apiService';
import postService from '../postService';
import appConfig from '../../config/appConfig';
import { Post } from '../../types/post';

// Mock dependencies
jest.mock('../apiService');
jest.mock('../../config/appConfig', () => ({
  __esModule: true,
  default: {
    endpoints: {
      posts: {
        feed: '/api/posts',
        createPost: '/api/posts',
        getPost: '/api/posts/:id',
        likePost: '/api/posts/:id/like',
        unlikePost: '/api/posts/:id/unlike',
      },
    },
  },
}));

describe('postService', () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test fetchFeedPosts
  describe('fetchFeedPosts', () => {
    it('should call apiService.get with correct parameters', async () => {
      // Arrange
      const mockPosts = [{ id: '1', content: 'Test post' }] as Post[];
      const mockResponse = { posts: mockPosts, hasMore: false };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await postService.fetchFeedPosts();

      // Assert
      expect(apiService.get).toHaveBeenCalledWith(
        appConfig.endpoints.posts.feed,
        {
          params: { page: 1, limit: 20 },
        }
      );
      expect(result).toEqual(mockPosts);
    });

    it('should pass custom pagination parameters to the API', async () => {
      // Arrange
      const page = 2;
      const limit = 10;
      const mockPosts = [{ id: '1', content: 'Test post' }] as Post[];
      const mockResponse = { posts: mockPosts, hasMore: true };
      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await postService.fetchFeedPosts(page, limit);

      // Assert
      expect(apiService.get).toHaveBeenCalledWith(
        appConfig.endpoints.posts.feed,
        {
          params: { page, limit },
        }
      );
      expect(result).toEqual(mockPosts);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const mockError = new Error('Network error');
      (apiService.get as jest.Mock).mockRejectedValue(mockError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      // Act & Assert
      await expect(postService.fetchFeedPosts()).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching feed posts:',
        mockError
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  // Test getPostById
  describe('getPostById', () => {
    it('should call apiService.get with correct URL replacing the :id parameter', async () => {
      // Arrange
      const postId = '123';
      const mockPost = { id: postId, content: 'Test post' } as Post;
      (apiService.get as jest.Mock).mockResolvedValue(mockPost);

      // Act
      const result = await postService.getPostById(postId);

      // Assert
      const expectedUrl = appConfig.endpoints.posts.getPost.replace(
        ':id',
        postId
      );
      expect(apiService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toEqual(mockPost);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const postId = '123';
      const mockError = new Error('Network error');
      (apiService.get as jest.Mock).mockRejectedValue(mockError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      // Act & Assert
      await expect(postService.getPostById(postId)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error fetching post ${postId}:`,
        mockError
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  // Test likePost
  describe('likePost', () => {
    it('should call apiService.post with correct URL', async () => {
      // Arrange
      const postId = '123';
      const mockPost = {
        id: postId,
        content: 'Test post',
        likes: 1,
        likedByUser: true,
      } as Post;
      (apiService.post as jest.Mock).mockResolvedValue(mockPost);

      // Act
      const result = await postService.likePost(postId);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith(`/api/posts/${postId}/like`);
      expect(result).toEqual(mockPost);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const postId = '123';
      const mockError = new Error('Network error');
      (apiService.post as jest.Mock).mockRejectedValue(mockError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      // Act & Assert
      await expect(postService.likePost(postId)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error liking post ${postId}:`,
        mockError
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  // Test unlikePost
  describe('unlikePost', () => {
    it('should call apiService.post with correct URL', async () => {
      // Arrange
      const postId = '123';
      const mockResponse = { success: true };
      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await postService.unlikePost(postId);

      // Assert
      expect(apiService.post).toHaveBeenCalledWith(
        `/api/posts/${postId}/unlike`
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const postId = '123';
      const mockError = new Error('Network error');
      (apiService.post as jest.Mock).mockRejectedValue(mockError);

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      // Act & Assert
      await expect(postService.unlikePost(postId)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error unliking post ${postId}:`,
        mockError
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  // Test createPost
  describe('createPost', () => {
    it('should call apiService.postForm with correct URL and FormData', async () => {
      // Arrange
      const content = 'Test post content';
      const mockPost = { id: '1', content } as Post;
      (apiService.postForm as jest.Mock).mockResolvedValue(mockPost);

      // Mock FormData since it's not available in test environment
      global.FormData = jest.fn().mockImplementation(() => ({
        append: jest.fn(),
      }));

      // Act
      const result = await postService.createPost(content);

      // Assert
      expect(apiService.postForm).toHaveBeenCalled();

      // Get the FormData argument
      const formDataArg = (apiService.postForm as jest.Mock).mock.calls[0][1];
      expect(formDataArg.append).toHaveBeenCalledWith('content', content);

      expect(result).toEqual(mockPost);
    });

    it('should throw error when API call fails', async () => {
      // Arrange
      const content = 'Test post content';
      const mockError = new Error('Network error');
      (apiService.postForm as jest.Mock).mockRejectedValue(mockError);

      // Mock FormData
      global.FormData = jest.fn().mockImplementation(() => ({
        append: jest.fn(),
      }));

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error');
      consoleErrorSpy.mockImplementation(() => {});

      // Act & Assert
      await expect(postService.createPost(content)).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating post:',
        mockError
      );

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });
});
