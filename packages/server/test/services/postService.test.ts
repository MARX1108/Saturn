import { ObjectId } from 'mongodb';
import { jest } from '@jest/globals';
import { PostService } from '@/modules/posts/services/postService';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { ActorService } from '@/modules/actors/services/actorService';
import { ActorRepository } from '@/modules/actors/repositories/actorRepository';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '@/utils/errors';
import { Post } from '@/modules/posts/models/post';
import { Actor } from '@/modules/actors/models/actor';

// Mock dependencies
jest.mock('@/modules/posts/repositories/postRepository');
jest.mock('@/modules/actors/services/actorService');
jest.mock('@/modules/actors/repositories/actorRepository');
jest.mock('@/modules/notifications/services/notification.service');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mock-uuid-12345'),
}));

// Generate deterministic ObjectIds to avoid Date.now dependency
const objectIdForTest = (suffix?: string): ObjectId => {
  // Generate a deterministic MongoDB ObjectId
  const hexId = suffix
    ? `60a0f3f1e1b8f1a1a8b4c1${suffix.padStart(2, '0')}`
    : '60a0f3f1e1b8f1a1a8b4c1ff';
  return new ObjectId(hexId);
};

describe('PostService', () => {
  // Setup mocks
  let postRepository: jest.Mocked<PostRepository>;
  let actorService: jest.Mocked<ActorService>;
  let notificationService: jest.Mocked<NotificationService>;
  let actorRepository: jest.Mocked<ActorRepository>;
  let postService: PostService;

  // Test data
  const mockDomain = 'test.domain';
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockTimestamp = mockDate.getTime();
  const mockActorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const mockPostId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const mockActor: Actor = {
    _id: mockActorId,
    id: `https://${mockDomain}/users/testuser`,
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    name: 'Test User',
    summary: 'Test summary',
    type: 'Person',
    inbox: `https://${mockDomain}/users/testuser/inbox`,
    outbox: `https://${mockDomain}/users/testuser/outbox`,
    followers: `https://${mockDomain}/users/testuser/followers`,
    following: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPost: Post = {
    _id: mockPostId,
    id: `https://${mockDomain}/posts/mock-uuid-12345`,
    type: 'Note',
    actorId: mockActorId,
    content: 'Test post content',
    visibility: 'public',
    sensitive: false,
    summary: undefined,
    attachments: [],
    published: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    attributedTo: `${mockActor.id}/${mockActorId.toString()}`,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [`${mockActor.followers}`],
    url: `https://${mockDomain}/posts/mock-uuid-12345`,
    replyCount: 0,
    likesCount: 0,
    sharesCount: 0,
    likedBy: [],
    sharedBy: [],
    actor: {
      id: mockActor.id,
      username: mockActor.username,
      preferredUsername: mockActor.preferredUsername,
      displayName: mockActor.displayName,
    },
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instances of mocks for each test
    postRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findFeed: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
      isOwner: jest.fn(),
      findByActorId: jest.fn(),
      countByActorId: jest.fn(),
    } as unknown as jest.Mocked<PostRepository>;

    actorService = {
      getActorById: jest.fn(),
      getActorByUsername: jest.fn(),
    } as unknown as jest.Mocked<ActorService>;

    notificationService = {
      createNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    actorRepository = {
      findByUsername: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<ActorRepository>;

    // Create service instance with mocked dependencies
    postService = new PostService(
      postRepository,
      actorService,
      mockDomain,
      actorRepository
    );

    // Set the notification service
    postService.setNotificationService(notificationService);

    // Mock Date constructor and static methods
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // Mock Date.now() since ObjectId uses it
    Date.now = jest
      .fn()
      .mockReturnValue(mockTimestamp) as unknown as () => number;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createPost', () => {
    it('should create a post successfully with string actorId', async () => {
      // Arrange
      const actorIdString = mockActorId.toString();
      const postData = {
        content: 'Test post content',
        actorId: actorIdString,
      };

      actorService.getActorById.mockResolvedValue(mockActor);
      actorRepository.findById.mockResolvedValue(mockActor);
      postRepository.create.mockResolvedValue(mockPost);

      // Act
      const result = await postService.createPost(postData);

      // Assert
      expect(actorService.getActorById).toHaveBeenCalledWith(
        expect.any(ObjectId)
      );
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: postData.content,
          actorId: expect.any(ObjectId),
          type: 'Note',
          visibility: 'public',
          to: ['https://www.w3.org/ns/activitystreams#Public'],
          cc: [mockActor.followers],
        })
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a post successfully with ObjectId actorId', async () => {
      // Arrange
      const postData = {
        content: 'Test post content',
        actorId: mockActorId,
      };

      actorService.getActorById.mockResolvedValue(mockActor);
      actorRepository.findById.mockResolvedValue(mockActor);
      postRepository.create.mockResolvedValue(mockPost);

      // Act
      const result = await postService.createPost(postData);

      // Assert
      expect(actorService.getActorById).toHaveBeenCalledWith(mockActorId);
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: postData.content,
          actorId: mockActorId,
        })
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a post with followers visibility', async () => {
      // Arrange
      const postData = {
        content: 'Test post content',
        actorId: mockActorId,
        visibility: 'followers' as const,
      };

      actorService.getActorById.mockResolvedValue(mockActor);
      actorRepository.findById.mockResolvedValue(mockActor);
      postRepository.create.mockResolvedValue({
        ...mockPost,
        visibility: 'followers',
        to: [mockActor.followers],
        cc: [],
      });

      // Act
      const result = await postService.createPost(postData);

      // Assert
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          visibility: 'followers',
          to: [mockActor.followers],
          cc: [],
        })
      );
      expect(result.visibility).toBe('followers');
    });

    it('should create a post with direct visibility', async () => {
      // Arrange
      const postData = {
        content: 'Test post content',
        actorId: mockActorId,
        visibility: 'direct' as const,
      };

      actorService.getActorById.mockResolvedValue(mockActor);
      actorRepository.findById.mockResolvedValue(mockActor);
      postRepository.create.mockResolvedValue({
        ...mockPost,
        visibility: 'direct',
        to: [],
        cc: [],
      });

      // Act
      const result = await postService.createPost(postData);

      // Assert
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          visibility: 'direct',
          to: [],
          cc: [],
        })
      );
      expect(result.visibility).toBe('direct');
    });

    it('should create a sensitive post with summary', async () => {
      // Arrange
      const postData = {
        content: 'Test post content',
        actorId: mockActorId,
        sensitive: true,
        summary: 'Content warning',
      };

      actorService.getActorById.mockResolvedValue(mockActor);
      actorRepository.findById.mockResolvedValue(mockActor);
      postRepository.create.mockResolvedValue({
        ...mockPost,
        sensitive: true,
        summary: 'Content warning',
      });

      // Act
      const result = await postService.createPost(postData);

      // Assert
      expect(postRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sensitive: true,
          summary: 'Content warning',
        })
      );
      expect(result.sensitive).toBe(true);
      expect(result.summary).toBe('Content warning');
    });

    it('should throw an error if actor is not found', async () => {
      // Arrange
      const postData = {
        content: 'Test post content',
        actorId: mockActorId,
      };

      actorService.getActorById.mockResolvedValue(null);

      // Act & Assert
      await expect(postService.createPost(postData)).rejects.toThrow(
        new AppError('Author not found', 404, ErrorType.NOT_FOUND)
      );
      expect(postRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getPostById', () => {
    it('should return a post by its id', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      postRepository.findOne.mockResolvedValue(mockPost);

      // Act
      const result = await postService.getPostById(postId);

      // Assert
      expect(postRepository.findOne).toHaveBeenCalledWith({ id: postId });
      expect(result).toEqual(mockPost);
    });

    it('should return null if post is not found', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/nonexistent';
      postRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await postService.getPostById(postId);

      // Assert
      expect(postRepository.findOne).toHaveBeenCalledWith({ id: postId });
      expect(result).toBeNull();
    });
  });

  describe('getFeed', () => {
    it('should return feed posts with pagination', async () => {
      // Arrange
      const options = { page: 2, limit: 10 };
      const posts = [mockPost, { ...mockPost, _id: objectIdForTest('d4') }];

      postRepository.findFeed.mockResolvedValue(posts);
      actorService.getActorById.mockResolvedValue(mockActor);

      // Act
      const result = await postService.getFeed(options);

      // Assert
      expect(postRepository.findFeed).toHaveBeenCalledWith({
        sort: { published: -1 },
        skip: 10, // (page-1) * limit
        limit: 11, // limit + 1 to check if there's more
      });
      expect(result.posts).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle hasMore flag when there are more posts', async () => {
      // Arrange
      const options = { page: 1, limit: 2 };
      const posts = [
        mockPost,
        { ...mockPost, _id: objectIdForTest('d4') },
        { ...mockPost, _id: objectIdForTest('d5') }, // Extra post
      ];

      postRepository.findFeed.mockResolvedValue(posts);
      actorService.getActorById.mockResolvedValue(mockActor);

      // Act
      const result = await postService.getFeed(options);

      // Assert
      expect(result.posts).toHaveLength(2); // Only returns 2 despite having 3
      expect(result.hasMore).toBe(true);
    });

    it('should use default pagination values when none are provided', async () => {
      // Arrange
      const posts = [mockPost];

      postRepository.findFeed.mockResolvedValue(posts);
      actorService.getActorById.mockResolvedValue(mockActor);

      // Act
      const result = await postService.getFeed();

      // Assert
      expect(postRepository.findFeed).toHaveBeenCalledWith({
        sort: { published: -1 },
        skip: 0, // Default page is 1
        limit: 21, // Default limit is 20 + 1
      });
      expect(result.posts).toHaveLength(1);
      expect(result.hasMore).toBe(false);
    });

    it('should populate actor data for posts without actors', async () => {
      // Arrange
      const postWithoutActor = { ...mockPost, actor: undefined };
      const posts = [postWithoutActor];

      postRepository.findFeed.mockResolvedValue(posts);
      actorService.getActorById.mockResolvedValue(mockActor);

      // Act
      const result = await postService.getFeed();

      // Assert
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockActorId.toString()
      );
      expect(result.posts[0].actor).toBeDefined();
    });

    it('should handle error when populating actor', async () => {
      // Arrange
      const postWithoutActor = { ...mockPost, actor: undefined };
      const posts = [postWithoutActor];

      postRepository.findFeed.mockResolvedValue(posts);
      actorService.getActorById.mockRejectedValue(new Error('Database error'));

      // Mock console.error to prevent test output noise
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await postService.getFeed();

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(result.posts[0].actor).toBeUndefined();
    });
  });

  describe('getPostsByUsername', () => {
    it('should return posts by username with pagination', async () => {
      // Arrange
      const username = 'testuser';
      const options = { limit: 10, offset: 0 };
      const posts = [mockPost, { ...mockPost, _id: objectIdForTest('f1') }];

      actorRepository.findByUsername.mockResolvedValue(mockActor);
      postRepository.findByActorId.mockResolvedValue(posts);
      postRepository.countByActorId.mockResolvedValue(2);

      // Act
      const result = await postService.getPostsByUsername(username, options);

      // Assert
      expect(actorRepository.findByUsername).toHaveBeenCalledWith(username);
      expect(postRepository.findByActorId).toHaveBeenCalledWith(
        mockActorId.toString(),
        options
      );
      expect(postRepository.countByActorId).toHaveBeenCalledWith(
        mockActorId.toString()
      );
      expect(result.posts).toEqual(posts);
      expect(result.total).toBe(2);
      expect(result.offset).toBe(0);
    });

    it('should return empty result if user not found', async () => {
      // Arrange
      const username = 'nonexistentuser';
      const options = { limit: 10, offset: 0 };

      actorRepository.findByUsername.mockResolvedValue(null);

      // Act
      const result = await postService.getPostsByUsername(username, options);

      // Assert
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.offset).toBe(0);
    });

    it('should handle errors and return empty result', async () => {
      // Arrange
      const username = 'testuser';
      const options = { limit: 10, offset: 0 };

      actorRepository.findByUsername.mockRejectedValue(
        new Error('Database error')
      );

      // Mock console.error to prevent test output noise
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      const result = await postService.getPostsByUsername(username, options);

      // Assert
      expect(console.error).toHaveBeenCalled();
      expect(result.posts).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.offset).toBe(0);
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully when user is owner', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();
      const updates = {
        content: 'Updated content',
        sensitive: true,
        summary: 'New summary',
      };
      const updatedPost = { ...mockPost, ...updates };

      postRepository.isOwner.mockResolvedValue(true);
      postRepository.update.mockResolvedValue(updatedPost);

      // Act
      const result = await postService.updatePost(postId, actorId, updates);

      // Assert
      expect(postRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
      expect(postRepository.update).toHaveBeenCalledWith(postId, updates);
      expect(result).toEqual(updatedPost);
    });

    it('should throw an error when user is not the owner', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = 'different-actor-id';
      const updates = { content: 'Updated content' };

      postRepository.isOwner.mockResolvedValue(false);

      // Act & Assert
      await expect(
        postService.updatePost(postId, actorId, updates)
      ).rejects.toThrow(
        new AppError(
          'User not authorized to update this post',
          403,
          ErrorType.FORBIDDEN
        )
      );
      expect(postRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully when user is owner', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();

      postRepository.isOwner.mockResolvedValue(true);
      postRepository.deleteById.mockResolvedValue(true);

      // Act
      const result = await postService.deletePost(postId, actorId);

      // Assert
      expect(postRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
      expect(postRepository.deleteById).toHaveBeenCalledWith(postId);
      expect(result).toBe(true);
    });

    it('should throw an error when user is not the owner', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = 'different-actor-id';

      postRepository.isOwner.mockResolvedValue(false);

      // Act & Assert
      await expect(postService.deletePost(postId, actorId)).rejects.toThrow(
        new AppError(
          'User not authorized to delete this post',
          403,
          ErrorType.FORBIDDEN
        )
      );
      expect(postRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('isOwner', () => {
    it('should delegate to repository', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();

      postRepository.isOwner.mockResolvedValue(true);

      // Act
      const result = await postService.isOwner(postId, actorId);

      // Assert
      expect(postRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
      expect(result).toBe(true);
    });
  });

  describe('likePost', () => {
    it('should like a post successfully with string actorId', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();
      const likedPost = {
        ...mockPost,
        likesCount: 1,
        likedBy: [mockActorId],
      };

      postRepository.findOneAndUpdate.mockResolvedValue(likedPost);

      // Act
      const result = await postService.likePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: postId },
        {
          $addToSet: { likedBy: expect.any(ObjectId) },
          $inc: { likesCount: 1 },
          $set: { updatedAt: mockDate },
        }
      );
      expect(result).toEqual(likedPost);
    });

    it('should like a post successfully with ObjectId actorId', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId;
      const likedPost = {
        ...mockPost,
        likesCount: 1,
        likedBy: [mockActorId],
      };

      postRepository.findOneAndUpdate.mockResolvedValue(likedPost);

      // Act
      const result = await postService.likePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: postId },
        {
          $addToSet: { likedBy: mockActorId },
          $inc: { likesCount: 1 },
          $set: { updatedAt: mockDate },
        }
      );
      expect(result).toEqual(likedPost);
    });

    it('should return null if post not found or already liked', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/nonexistent';
      const actorId = mockActorId.toString();

      postRepository.findOneAndUpdate.mockResolvedValue(null);

      // Act
      const result = await postService.likePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post successfully with string actorId', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();
      const unlikedPost = {
        ...mockPost,
        likesCount: 0,
        likedBy: [],
      };

      postRepository.findOneAndUpdate.mockResolvedValue(unlikedPost);

      // Act
      const result = await postService.unlikePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: postId, likedBy: expect.any(ObjectId) },
        {
          $pull: { likedBy: expect.any(ObjectId) },
          $inc: { likesCount: -1 },
          $set: { updatedAt: mockDate },
        }
      );
      expect(result).toEqual(unlikedPost);
    });

    it('should return null if post not found or not already liked', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();

      postRepository.findOneAndUpdate.mockResolvedValue(null);

      // Act
      const result = await postService.unlikePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('sharePost', () => {
    it('should share a post successfully', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();
      const sharedPost = {
        ...mockPost,
        sharesCount: 1,
        sharedBy: [mockActorId],
      };

      postRepository.findOneAndUpdate.mockResolvedValue(sharedPost);

      // Act
      const result = await postService.sharePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: postId },
        {
          $addToSet: { sharedBy: expect.any(ObjectId) },
          $inc: { sharesCount: 1 },
          $set: { updatedAt: mockDate },
        }
      );
      expect(result).toEqual(sharedPost);
    });

    it('should return null if post not found', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/nonexistent';
      const actorId = mockActorId.toString();

      postRepository.findOneAndUpdate.mockResolvedValue(null);

      // Act
      const result = await postService.sharePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('unsharePost', () => {
    it('should unshare a post successfully', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();
      const unsharedPost = {
        ...mockPost,
        sharesCount: 0,
        sharedBy: [],
      };

      postRepository.findOneAndUpdate.mockResolvedValue(unsharedPost);

      // Act
      const result = await postService.unsharePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalledWith(
        { id: postId, sharedBy: expect.any(ObjectId) },
        {
          $pull: { sharedBy: expect.any(ObjectId) },
          $inc: { sharesCount: -1 },
          $set: { updatedAt: mockDate },
        }
      );
      expect(result).toEqual(unsharedPost);
    });

    it('should return null if post not found or not already shared', async () => {
      // Arrange
      const postId = 'https://test.domain/posts/123';
      const actorId = mockActorId.toString();

      postRepository.findOneAndUpdate.mockResolvedValue(null);

      // Act
      const result = await postService.unsharePost(postId, actorId);

      // Assert
      expect(postRepository.findOneAndUpdate).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
