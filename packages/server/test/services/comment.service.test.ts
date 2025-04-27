import { ObjectId } from 'mongodb';
import { jest } from '@jest/globals';
import { CommentService } from '@/modules/comments/services/comment.service';
import { CommentRepository } from '@/modules/comments/repositories/comment.repository';
import { PostService } from '@/modules/posts/services/postService';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { Comment, FormattedComment } from '@/modules/comments/models/comment';
import { NotificationType } from '@/modules/notifications/models/notification';
import { AppError, ErrorType } from '@/utils/errors';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import { WithId } from 'mongodb';
import { Notification } from '@/modules/notifications/models/notification';

// Mock dependencies
jest.mock('@/modules/comments/repositories/comment.repository');
jest.mock('@/modules/posts/services/postService');
jest.mock('@/modules/actors/services/actorService');
jest.mock('@/modules/notifications/services/notification.service');

describe('CommentService', () => {
  // Setup mocks
  let commentRepository: jest.Mocked<CommentRepository>;
  let postService: jest.Mocked<PostService>;
  let actorService: jest.Mocked<ActorService>;
  let notificationService: jest.Mocked<NotificationService>;
  let commentService: CommentService;

  // Test data
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockActorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const mockPostId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const mockCommentId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c5');

  const mockActor: Actor = {
    _id: mockActorId,
    id: 'https://test.domain/users/testuser',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    name: 'Test User',
    summary: 'Test summary',
    type: 'Person',
    inbox: 'https://test.domain/users/testuser/inbox',
    outbox: 'https://test.domain/users/testuser/outbox',
    followers: 'https://test.domain/users/testuser/followers',
    following: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPost: Post = {
    _id: mockPostId,
    id: 'https://test.domain/posts/mock-uuid-12345',
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
    url: 'https://test.domain/posts/mock-uuid-12345',
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

  const mockComment: WithId<Comment> = {
    _id: mockCommentId,
    postId: mockPostId.toString(),
    actorId: mockActorId,
    authorId: mockActorId.toString(),
    content: 'Test comment content',
    likesCount: 0,
    likedBy: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockFormattedComment: FormattedComment = {
    ...mockComment,
    author: {
      id: mockActorId.toString(),
      username: mockActor.preferredUsername,
      displayName: mockActor.displayName,
      avatarUrl: undefined,
    },
  };

  const mockNotification: Notification = {
    _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1d1'),
    type: NotificationType.COMMENT,
    recipientUserId: mockActorId.toString(),
    actorUserId: mockActorId.toString(),
    read: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instances of mocks for each test
    commentRepository = {
      create: jest.fn(),
      findCommentsByPostId: jest.fn(),
      deleteByIdAndAuthorId: jest.fn(),
      countByPostId: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<CommentRepository>;

    postService = {
      getPostById: jest.fn(),
    } as unknown as jest.Mocked<PostService>;

    actorService = {
      getActorById: jest.fn(),
      getActorByUsername: jest.fn(),
    } as unknown as jest.Mocked<ActorService>;

    notificationService = {
      createNotification: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;

    // Create service instance with mocked dependencies
    commentService = new CommentService(commentRepository);
    commentService.setPostService(postService);
    commentService.setActorService(actorService);
    commentService.setNotificationService(notificationService);

    // Mock Date constructor
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      // Arrange
      postService.getPostById.mockResolvedValue(mockPost);
      actorService.getActorById.mockResolvedValue(mockActor);
      commentRepository.create.mockResolvedValue(mockComment);
      notificationService.createNotification.mockResolvedValue(
        mockNotification
      );

      const commentData = {
        content: 'Test comment content',
        postId: mockPostId.toString(),
        authorId: mockActorId.toString(),
      };

      // Act
      const result = await commentService.createComment(
        mockPostId.toString(),
        mockActorId.toString(),
        commentData
      );

      // Assert
      expect(postService.getPostById).toHaveBeenCalledWith(
        mockPostId.toString()
      );
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockActorId.toString()
      );
      expect(commentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          content: commentData.content,
          postId: mockPostId.toString(),
          actorId: mockActorId,
          createdAt: mockDate,
          updatedAt: mockDate,
          likesCount: 0,
          likedBy: [],
        })
      );
      expect(result).toEqual(mockComment);
      // Verify notification was not created (since author and post owner are the same)
      expect(notificationService.createNotification).not.toHaveBeenCalled();
    });

    it('should create a comment and send notification to post author', async () => {
      // Arrange
      const postAuthorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c2');
      const postWithDifferentAuthor = {
        ...mockPost,
        actorId: postAuthorId,
      };

      postService.getPostById.mockResolvedValue(postWithDifferentAuthor);
      actorService.getActorById.mockResolvedValue(mockActor);
      commentRepository.create.mockResolvedValue(mockComment);
      notificationService.createNotification.mockResolvedValue(
        mockNotification
      );

      const commentData = {
        content: 'Test comment content',
        postId: mockPostId.toString(),
        authorId: mockActorId.toString(),
      };

      // Act
      const result = await commentService.createComment(
        mockPostId.toString(),
        mockActorId.toString(),
        commentData
      );

      // Assert
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientUserId: postAuthorId.toHexString(),
          actorUserId: mockActorId.toHexString(),
          type: NotificationType.COMMENT,
          postId: mockPostId.toHexString(),
          commentId: mockCommentId.toString(),
        })
      );
      expect(result).toEqual(mockComment);
    });

    it('should throw an error if post not found', async () => {
      // Arrange
      postService.getPostById.mockResolvedValue(null);

      const commentData = {
        content: 'Test comment content',
        postId: mockPostId.toString(),
        authorId: mockActorId.toString(),
      };

      // Act & Assert
      await expect(
        commentService.createComment(
          mockPostId.toString(),
          mockActorId.toString(),
          commentData
        )
      ).rejects.toThrow(
        new AppError('Post not found', 404, ErrorType.NOT_FOUND)
      );

      expect(commentRepository.create).not.toHaveBeenCalled();
    });

    it('should throw an error if author not found', async () => {
      // Arrange
      postService.getPostById.mockResolvedValue(mockPost);
      actorService.getActorById.mockResolvedValue(null);

      const commentData = {
        content: 'Test comment content',
        postId: mockPostId.toString(),
        authorId: mockActorId.toString(),
      };

      // Act & Assert
      await expect(
        commentService.createComment(
          mockPostId.toString(),
          mockActorId.toString(),
          commentData
        )
      ).rejects.toThrow(
        new AppError('Author not found', 404, ErrorType.NOT_FOUND)
      );

      expect(commentRepository.create).not.toHaveBeenCalled();
    });

    it('should process mentions in content and send notifications', async () => {
      // Arrange
      const mentionedUser = {
        ...mockActor,
        _id: new ObjectId('60a0f3f1e1b8f1a1a8b4c1c7'),
        preferredUsername: 'mentioned',
      };

      postService.getPostById.mockResolvedValue(mockPost);
      actorService.getActorById.mockResolvedValue(mockActor);
      actorService.getActorByUsername.mockResolvedValue(mentionedUser);
      commentRepository.create.mockResolvedValue(mockComment);
      notificationService.createNotification.mockResolvedValue(
        mockNotification
      );

      const commentData = {
        content: 'Hey @mentioned check this out!',
        postId: mockPostId.toString(),
        authorId: mockActorId.toString(),
      };

      // Act
      await commentService.createComment(
        mockPostId.toString(),
        mockActorId.toString(),
        commentData
      );

      // Assert
      expect(actorService.getActorByUsername).toHaveBeenCalledWith('mentioned');
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.MENTION,
          recipientUserId: mentionedUser._id.toHexString(),
          actorUserId: mockActorId.toHexString(),
          postId: mockPostId.toHexString(),
          commentId: mockCommentId.toString(),
        })
      );
    });
  });

  describe('getCommentsForPost', () => {
    it('should get comments for a post with proper formatting', async () => {
      // Arrange
      const paginationOptions = { limit: 10, offset: 0 };
      const comments = [mockComment];
      const total = 1;

      postService.getPostById.mockResolvedValue(mockPost);
      commentRepository.findCommentsByPostId.mockResolvedValue({
        comments,
        total,
      });
      actorService.getActorById.mockResolvedValue(mockActor);

      // Act
      const result = await commentService.getCommentsForPost(
        mockPostId.toString(),
        paginationOptions
      );

      // Assert
      expect(postService.getPostById).toHaveBeenCalledWith(
        mockPostId.toString()
      );
      expect(commentRepository.findCommentsByPostId).toHaveBeenCalledWith(
        mockPostId.toString(),
        paginationOptions
      );
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockComment.authorId
      );
      expect(result).toEqual({
        comments: [mockFormattedComment],
        total,
        limit: paginationOptions.limit,
        offset: paginationOptions.offset,
      });
    });

    it('should format comments with unknown author if actor not found', async () => {
      // Arrange
      const paginationOptions = { limit: 10, offset: 0 };
      const comments = [mockComment];
      const total = 1;

      postService.getPostById.mockResolvedValue(mockPost);
      commentRepository.findCommentsByPostId.mockResolvedValue({
        comments,
        total,
      });
      actorService.getActorById.mockResolvedValue(null);

      // Act
      const result = await commentService.getCommentsForPost(
        mockPostId.toString(),
        paginationOptions
      );

      // Assert
      expect(result.comments[0].author).toEqual({
        id: mockComment.authorId,
        username: 'unknown',
        displayName: 'Unknown User',
        avatarUrl: undefined,
      });
    });

    it('should throw an error if post not found', async () => {
      // Arrange
      const paginationOptions = { limit: 10, offset: 0 };
      postService.getPostById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        commentService.getCommentsForPost(
          mockPostId.toString(),
          paginationOptions
        )
      ).rejects.toThrow(
        new AppError(
          `Post with ID ${mockPostId} not found`,
          404,
          ErrorType.NOT_FOUND
        )
      );

      expect(commentRepository.findCommentsByPostId).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      // Arrange
      commentRepository.deleteByIdAndAuthorId.mockResolvedValue({
        deletedCount: 1,
      });

      // Act
      const result = await commentService.deleteComment(
        mockCommentId.toString(),
        mockActorId.toString()
      );

      // Assert
      expect(commentRepository.deleteByIdAndAuthorId).toHaveBeenCalledWith(
        mockCommentId.toString(),
        mockActorId.toString()
      );
      expect(result).toBe(true);
    });

    it('should throw an error if comment not found or user not authorized', async () => {
      // Arrange
      commentRepository.deleteByIdAndAuthorId.mockResolvedValue({
        deletedCount: 0,
      });

      // Act & Assert
      await expect(
        commentService.deleteComment(
          mockCommentId.toString(),
          mockActorId.toString()
        )
      ).rejects.toThrow(
        new AppError(
          "Comment not found or you don't have permission to delete it",
          404,
          ErrorType.NOT_FOUND
        )
      );
    });
  });

  describe('getComments', () => {
    it('should call repository function to get comments', async () => {
      // This is testing the simpler getComments method that returns an empty array for now
      const result = await commentService.getComments(mockPostId.toString());
      expect(result).toEqual([]);
    });
  });
});
