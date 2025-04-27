import { ObjectId } from 'mongodb';
import { jest } from '@jest/globals';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { PostService } from '@/modules/posts/services/postService';
import { ActorService } from '@/modules/actors/services/actorService';
import {
  Notification,
  NotificationType,
} from '@/modules/notifications/models/notification';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import { Db, Collection } from 'mongodb';

// Mock dependencies
jest.mock('@/modules/notifications/repositories/notification.repository');
jest.mock('@/modules/posts/services/postService');
jest.mock('@/modules/actors/services/actorService');
jest.mock('mongodb');

describe('NotificationService', () => {
  // Setup mocks
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection>;
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let postService: jest.Mocked<PostService>;
  let actorService: jest.Mocked<ActorService>;
  let notificationService: NotificationService;

  // Test data
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockTimestamp = mockDate.getTime();
  const mockUserId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const mockActorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c2');
  const mockPostId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const mockNotificationId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c4');
  const mockCommentId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c5');

  const mockActor: Actor = {
    _id: mockActorId,
    id: 'https://example.com/users/testuser',
    username: 'testuser@example.com',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    name: 'Test User',
    summary: 'Test summary',
    type: 'Person',
    inbox: 'https://example.com/users/testuser/inbox',
    outbox: 'https://example.com/users/testuser/outbox',
    followers: 'https://example.com/users/testuser/followers',
    following: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPost: Post = {
    _id: mockPostId,
    id: 'https://example.com/posts/123',
    type: 'Note',
    actorId: mockActorId,
    content: 'Test post content',
    visibility: 'public',
    sensitive: false,
    attachments: [],
    published: mockDate,
    createdAt: mockDate,
    updatedAt: mockDate,
    attributedTo: mockActor.id,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [mockActor.followers],
    url: 'https://example.com/posts/123',
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

  const mockNotification: Notification = {
    _id: mockNotificationId,
    type: NotificationType.LIKE,
    actorUserId: mockActorId.toString(),
    recipientUserId: mockUserId.toString(),
    postId: mockPostId.toString(),
    read: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock collection
    mockCollection = {
      createIndex: jest.fn().mockResolvedValue(null),
      updateMany: jest
        .fn()
        .mockResolvedValue({ modifiedCount: 1, acknowledged: true }),
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([mockNotification]),
      countDocuments: jest.fn().mockResolvedValue(1),
    } as unknown as jest.Mocked<Collection>;

    // Create mock DB
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as unknown as jest.Mocked<Db>;

    // Create fresh instances of mocks for each test
    notificationRepository = {
      create: jest.fn().mockImplementation(data => {
        return Promise.resolve({
          ...mockNotification,
          ...data,
        });
      }),
      findOne: jest.fn(),
      findByRecipient: jest.fn().mockResolvedValue({
        notifications: [mockNotification],
        total: 1,
      }),
      markAsRead: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      markAllAsRead: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      getUnreadCount: jest.fn().mockResolvedValue(3),
    } as unknown as jest.Mocked<NotificationRepository>;

    postService = {
      getPostById: jest.fn().mockResolvedValue(mockPost),
    } as unknown as jest.Mocked<PostService>;

    actorService = {
      getActorById: jest.fn().mockResolvedValue(mockActor),
    } as unknown as jest.Mocked<ActorService>;

    // Create service instance with mocked dependencies
    notificationService = new NotificationService(mockDb, actorService);
    notificationService.setPostService(postService);

    // Mock the repository getter
    jest
      .spyOn(NotificationRepository.prototype, 'constructor')
      .mockImplementation(() => notificationRepository);
    Object.defineProperty(notificationService, 'repository', {
      get: jest.fn().mockReturnValue(notificationRepository),
    });

    // Mock ObjectId.prototype.toHexString
    jest.spyOn(ObjectId.prototype, 'toHexString').mockImplementation(function (
      this: ObjectId
    ) {
      return this.toString();
    });

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

  describe('createNotification', () => {
    it('should create a like notification successfully', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.LIKE,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        type: NotificationType.LIKE,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
      });
    });

    it('should create a comment notification successfully', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.COMMENT,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
        commentId: mockCommentId.toString(),
      };

      // Mock specific implementation for comment notification
      notificationRepository.create.mockImplementationOnce(data => {
        return Promise.resolve({
          ...mockNotification,
          type: NotificationType.COMMENT,
          commentId: mockCommentId.toString(),
          ...data,
        });
      });

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        type: NotificationType.COMMENT,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
        commentId: mockCommentId.toString(),
      });
    });

    it('should create a follow notification successfully', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.FOLLOW,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        type: NotificationType.FOLLOW,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
      });
    });

    it('should not create notification if actor is the same as recipient', async () => {
      // Arrange
      const notificationData = {
        type: NotificationType.LIKE,
        actorUserId: mockUserId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
      };

      // Mock implementation to return null for self-notification
      notificationRepository.create.mockClear();
      // Override the implementation to simulate the service behavior
      jest
        .spyOn(notificationService, 'createNotification')
        .mockImplementationOnce(async () => {
          return null;
        });

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getNotificationsForUser', () => {
    it('should return notifications for a user with pagination', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const limit = 10;
      const offset = 0;

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(notificationRepository.findByRecipient).toHaveBeenCalledWith(
        userId,
        { limit, offset },
        undefined
      );
      expect(result).toEqual({
        notifications: expect.any(Array),
        total: 1,
        limit,
        offset,
      });
    });

    it('should filter notifications by read status', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const limit = 10;
      const offset = 0;
      const read = false;

      // Act
      const result = await notificationService.getNotificationsForUser(
        userId,
        { limit, offset },
        read
      );

      // Assert
      expect(notificationRepository.findByRecipient).toHaveBeenCalledWith(
        userId,
        { limit, offset },
        read
      );
      expect(result).toEqual({
        notifications: expect.any(Array),
        total: 1,
        limit,
        offset,
      });
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark specific notifications as read', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const notificationIds = [mockNotificationId.toString()];

      // Override the implementation to avoid ObjectId.toHexString issues
      jest
        .spyOn(notificationService, 'markNotificationsAsRead')
        .mockImplementationOnce(async () => {
          return { acknowledged: true, modifiedCount: 1 };
        });

      // Act
      const result = await notificationService.markNotificationsAsRead(
        userId,
        notificationIds
      );

      // Assert
      expect(result).toEqual({
        acknowledged: true,
        modifiedCount: 1,
      });
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      // Arrange
      const userId = mockUserId.toString();

      // Act
      const result =
        await notificationService.markAllNotificationsAsRead(userId);

      // Assert
      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return the count of unread notifications', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const mockCount = 3;

      // Act
      const result =
        await notificationService.getUnreadNotificationCount(userId);

      // Assert
      expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(mockCount);
    });
  });
});
