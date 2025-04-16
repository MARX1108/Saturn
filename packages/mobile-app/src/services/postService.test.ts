import apiService from './apiService';
import postService from './postService';
import { Post } from '../types/post';
import { ImagePickerAsset } from 'expo-image-picker';

// Mock dependencies
jest.mock('./apiService');
jest.mock('../config/appConfig', () => ({
  appConfig: {
    endpoints: {
      posts: {
        feed: '/api/posts/feed',
        getPost: '/api/posts/:id',
        likePost: '/api/posts/:id/like',
        createPost: '/api/posts',
      },
    },
  },
}));

describe('postService', () => {
  const mockPost: Post = {
    _id: '1',
    content: 'Test post',
    author: {
      _id: '1',
      preferredUsername: 'testuser',
      name: 'Test User',
    },
    createdAt: new Date().toISOString(),
    likeCount: 0,
    likedByUser: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFeedPosts', () => {
    const mockResponse = {
      posts: [mockPost],
      hasMore: false,
    };

    it('should fetch feed posts with default pagination', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await postService.fetchFeedPosts();

      expect(apiService.get).toHaveBeenCalledWith('/api/posts/feed', {
        params: { page: 1, limit: 20 },
      });
      expect(result).toEqual(mockResponse.posts);
    });

    it('should fetch feed posts with custom pagination', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await postService.fetchFeedPosts(2, 10);

      expect(apiService.get).toHaveBeenCalledWith('/api/posts/feed', {
        params: { page: 2, limit: 10 },
      });
      expect(result).toEqual(mockResponse.posts);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(postService.fetchFeedPosts()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getPostById', () => {
    it('should fetch a single post by ID', async () => {
      (apiService.get as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = await postService.getPostById('1');

      expect(apiService.get).toHaveBeenCalledWith('/api/posts/1');
      expect(result).toEqual(mockPost);
    });

    it('should handle fetch error', async () => {
      const error = new Error('Post not found');
      (apiService.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(postService.getPostById('1')).rejects.toThrow(
        'Post not found'
      );
    });
  });

  describe('likePost', () => {
    it('should like a post', async () => {
      const likedPost = { ...mockPost, likeCount: 1, likedByUser: true };
      (apiService.post as jest.Mock).mockResolvedValueOnce(likedPost);

      const result = await postService.likePost('1');

      expect(apiService.post).toHaveBeenCalledWith('/api/posts/1/like');
      expect(result).toEqual(likedPost);
    });

    it('should handle like error', async () => {
      const error = new Error('Failed to like post');
      (apiService.post as jest.Mock).mockRejectedValueOnce(error);

      await expect(postService.likePost('1')).rejects.toThrow(
        'Failed to like post'
      );
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      await postService.unlikePost('1');

      expect(apiService.delete).toHaveBeenCalledWith('/api/posts/1/like');
    });

    it('should handle unlike error', async () => {
      const error = new Error('Failed to unlike post');
      (apiService.delete as jest.Mock).mockRejectedValueOnce(error);

      await expect(postService.unlikePost('1')).rejects.toThrow(
        'Failed to unlike post'
      );
    });
  });

  describe('createPost', () => {
    const content = 'New post content';

    it('should create a text-only post', async () => {
      (apiService.postForm as jest.Mock).mockResolvedValueOnce(mockPost);

      const formData = new FormData();
      formData.append('content', content);

      const result = await postService.createPost(content);

      expect(apiService.postForm).toHaveBeenCalledWith('/api/posts', formData);
      expect(result).toEqual(mockPost);
    });

    it('should create a post with media', async () => {
      const mediaAsset: ImagePickerAsset = {
        uri: 'file://photo.jpg',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        width: 100,
        height: 100,
      };

      (apiService.postForm as jest.Mock).mockResolvedValueOnce(mockPost);

      const result = await postService.createPost(content, mediaAsset);

      expect(apiService.postForm).toHaveBeenCalledWith(
        '/api/posts',
        expect.any(FormData)
      );

      // Get the FormData passed to postForm
      const formData: FormData = (apiService.postForm as jest.Mock).mock
        .calls[0][1];
      expect(formData.get('content')).toBe(content);
      expect(formData.get('mediaFile')).toEqual({
        uri: mediaAsset.uri,
        name: mediaAsset.fileName,
        type: mediaAsset.mimeType,
      });
    });

    it('should handle create error', async () => {
      const error = new Error('Failed to create post');
      (apiService.postForm as jest.Mock).mockRejectedValueOnce(error);

      await expect(postService.createPost(content)).rejects.toThrow(
        'Failed to create post'
      );
    });
  });
});
