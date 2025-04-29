import { jest, expect } from '@jest/globals';
import {
  ObjectId,
  Collection,
  Db,
  Document,
  FindOptions,
  Filter,
  CountDocumentsOptions,
  WithId,
  OptionalId,
  UpdateResult,
  OptionalUnlessRequiredId,
} from 'mongodb';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { ActorService } from '@/modules/actors/services/actorService';
import { PostService } from '@/modules/posts/services/postService';
import { CommentService } from '@/modules/comments/services/comment.service';
import {
  Notification,
  CreateNotificationDto,
  NotificationType,
  FormattedNotification,
} from '@/modules/notifications/models/notification';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import { Comment } from '@/modules/comments/models/comment';

// Define simple mocks with 'any' that we'll cast when used
interface MockActorService {
  getActorById: jest.Mock;
}

interface MockPostService {
  getPostById: jest.Mock;
}

interface MockCommentService {
  getComments: jest.Mock;
  getCommentById: jest.Mock;
}

interface MockNotificationRepository {
  create: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  findByRecipient: jest.Mock;
  markAsRead: jest.Mock;
  markAllAsRead: jest.Mock;
  getUnreadCount: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  countDocuments: jest.Mock;
}

// Basic mock db
interface MockDb {
  collection: jest.Mock;
}

// Basic mock collection
interface MockCollection {
  find: jest.Mock;
  findOne: jest.Mock;
  insertOne: jest.Mock;
  updateOne: jest.Mock;
  updateMany: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
  countDocuments: jest.Mock;
  createIndex: jest.Mock;
}

// Mock the repositories and services
jest.mock('@/modules/notifications/repositories/notification.repository');

describe('NotificationService', () => {
  // Define typed mocks
  let actorService: MockActorService;
  let postService: MockPostService;
  let commentService: MockCommentService;
  let notificationRepository: MockNotificationRepository;
  let notificationService: NotificationService;
  let mockDb: MockDb;
  let mockCollection: MockCollection;

  // Create test data
  const mockDate = new Date('2023-01-01T12:00:00Z');
  const mockUserId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c1');
  const mockActorId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c2');
  const mockPostId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c3');
  const mockCommentId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c4');
  const mockNotificationId = new ObjectId('60a0f3f1e1b8f1a1a8b4c1c5');

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

  const mockDbNotification: Notification = {
    _id: mockNotificationId,
    type: NotificationType.LIKE,
    actorUserId: mockActorId.toHexString(),
    recipientUserId: mockUserId.toHexString(),
    postId: mockPostId.toHexString(),
    read: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockFormattedNotification: FormattedNotification = {
    ...mockDbNotification,
    id: mockNotificationId.toHexString(),
    actor: {
      id: mockActorId.toHexString(),
      username: mockActor.preferredUsername,
      displayName: mockActor.displayName || '',
    },
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  // Creating a mock success response for markAsRead and markAllAsRead
  const mockModifiedResponse = {
    acknowledged: true,
    modifiedCount: 1,
  };

  const mockDbError = new Error('Database error');

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock collection
    mockCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn().mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
        upsertedId: null,
        upsertedCount: 0,
        matchedCount: 1,
      }),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
      createIndex: jest.fn(),
    } as MockCollection;

    // Set up mock DB
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    } as MockDb;

    // Set up mock services
    actorService = {
      getActorById: jest.fn().mockResolvedValue(mockActor),
    } as MockActorService;

    postService = {
      getPostById: jest.fn().mockResolvedValue(null),
    } as MockPostService;

    commentService = {
      getComments: jest.fn(),
      getCommentById: jest.fn().mockResolvedValue(null),
    } as MockCommentService;

    // Set up mock repository
    notificationRepository = {
      create: jest.fn().mockResolvedValue(mockDbNotification),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockResolvedValue([mockDbNotification]),
      findByRecipient: jest.fn().mockResolvedValue({
        notifications: [mockDbNotification],
        total: 1,
      }),
      markAsRead: jest.fn().mockResolvedValue(mockModifiedResponse),
      markAllAsRead: jest.fn().mockResolvedValue(mockModifiedResponse),
      getUnreadCount: jest.fn().mockResolvedValue(5),
      update: jest.fn(),
      delete: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(1),
    } as MockNotificationRepository;

    // Create notification service with mocked dependencies
    notificationService = new NotificationService(
      mockDb as unknown as Db,
      actorService as unknown as ActorService
    );

    // Add repository getter mock
    Object.defineProperty(notificationService, 'repository', {
      get: jest.fn().mockReturnValue(notificationRepository),
    });

    // Set additional services
    notificationService.setPostService(postService as unknown as PostService);
    notificationService.setCommentService(
      commentService as unknown as CommentService
    );

    // Create a mock implementation for markNotificationsAsRead to use for testing
    jest
      .spyOn(notificationService, 'markNotificationsAsRead')
      .mockImplementation(
        (
          notificationIds: string[],
          userId: string | ObjectId
        ): Promise<{ acknowledged: boolean; modifiedCount: number }> => {
          return Promise.resolve({
            acknowledged: true,
            modifiedCount: mockModifiedResponse.modifiedCount,
          });
        }
      );

    // Create a mock implementation for markAllNotificationsAsRead to use for testing
    jest
      .spyOn(notificationService, 'markAllNotificationsAsRead')
      .mockImplementation(
        (userId: string): Promise<{ modifiedCount: number }> => {
          return Promise.resolve({
            modifiedCount: mockModifiedResponse.modifiedCount,
          });
        }
      );
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        recipientUserId: mockUserId.toHexString(),
        actorUserId: mockActorId.toHexString(),
        type: NotificationType.LIKE,
        postId: mockPostId.toHexString(),
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockDbNotification);
    });

    it('should prevent self-notifications', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        recipientUserId: mockUserId.toHexString(),
        actorUserId: mockUserId.toHexString(), // Same as recipient (self)
        type: NotificationType.LIKE,
        postId: mockPostId.toHexString(),
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw an error when repository create fails', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        recipientUserId: mockUserId.toHexString(),
        actorUserId: mockActorId.toHexString(),
        type: NotificationType.LIKE,
        postId: mockPostId.toHexString(),
      };

      notificationRepository.create.mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.createNotification(notificationData)
      ).rejects.toThrow('Database error');
    });

    it('should handle notification with comment ID', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        recipientUserId: mockUserId.toHexString(),
        actorUserId: mockActorId.toHexString(),
        type: NotificationType.COMMENT,
        postId: mockPostId.toHexString(),
        commentId: mockCommentId.toHexString(),
      };

      // Act
      await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          commentId: mockCommentId.toHexString(),
        })
      );
    });
  });

  describe('getNotificationsForUser', () => {
    it('should return formatted notifications for a user with pagination', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
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
      expect(result.notifications.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(limit);
      expect(result.offset).toBe(offset);
    });

    it('should filter notifications by read status', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
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
      expect(result.notifications.length).toBe(1);
    });

    it('should throw an error when repository findByRecipient fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const limit = 10;
      const offset = 0;

      // Make repository mock reject
      notificationRepository.findByRecipient.mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.getNotificationsForUser(userId, { limit, offset })
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid user ID format', async () => {
      // Arrange
      const invalidUserId = 'invalid-user-id';
      const limit = 10;
      const offset = 0;

      // Mock the repository.findByRecipient method to throw the expected error
      notificationRepository.findByRecipient.mockImplementationOnce(() => {
        throw new Error('Invalid ObjectId format');
      });

      // Act & Assert
      await expect(
        notificationService.getNotificationsForUser(invalidUserId, {
          limit,
          offset,
        })
      ).rejects.toThrow('Invalid ObjectId format');
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark specific notifications as read', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const notificationIds = [mockNotificationId.toHexString()];

      // Act
      const result = await notificationService.markNotificationsAsRead(
        notificationIds,
        userId
      );

      // Assert
      expect(result).toEqual(mockModifiedResponse);
    });

    it('should handle empty notification IDs array', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const notificationIds: string[] = [];

      // Mock result for empty array case
      jest
        .spyOn(notificationService, 'markNotificationsAsRead')
        .mockResolvedValueOnce({
          acknowledged: true,
          modifiedCount: 0,
        });

      // Act
      const result = await notificationService.markNotificationsAsRead(
        notificationIds,
        userId
      );

      // Assert
      expect(result.modifiedCount).toBe(0);
    });

    it('should throw an error when repository markAsRead fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const notificationIds = [mockNotificationId.toHexString()];

      // Mock error for this test
      jest
        .spyOn(notificationService, 'markNotificationsAsRead')
        .mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.markNotificationsAsRead(notificationIds, userId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read for a user', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      // Configure mocked response with modifiedCount = 3
      jest
        .spyOn(notificationService, 'markAllNotificationsAsRead')
        .mockResolvedValueOnce({
          modifiedCount: 3,
        });

      // Act
      const result =
        await notificationService.markAllNotificationsAsRead(userId);

      // Assert
      expect(result.modifiedCount).toBe(3);
    });

    it('should handle case when no notifications were unread', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      // Mock repository to return 0 modified
      jest
        .spyOn(notificationService, 'markAllNotificationsAsRead')
        .mockResolvedValueOnce({
          modifiedCount: 0,
        });

      // Act
      const result =
        await notificationService.markAllNotificationsAsRead(userId);

      // Assert
      expect(result.modifiedCount).toBe(0);
    });

    it('should throw an error when repository markAllAsRead fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      // Mock error for this test
      jest
        .spyOn(notificationService, 'markAllNotificationsAsRead')
        .mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.markAllNotificationsAsRead(userId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return the count of unread notifications', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      // Act
      const result =
        await notificationService.getUnreadNotificationCount(userId);

      // Assert
      expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith(
        userId
      );
      expect(result).toBe(5);
    });

    it('should throw an error when repository getUnreadCount fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      notificationRepository.getUnreadCount.mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.getUnreadNotificationCount(userId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('getNotifications', () => {
    it('should return notifications for a user', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      // Act
      const result = await notificationService.getNotifications(userId);

      // Assert
      expect(notificationRepository.findByRecipient).toHaveBeenCalledWith(
        userId,
        { limit: 50, offset: 0 }
      );
      expect(result).toEqual([mockDbNotification]);
    });

    it('should throw an error when repository findByRecipient fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();

      notificationRepository.findByRecipient.mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.getNotifications(userId)
      ).rejects.toThrow('Database error');
    });
  });

  describe('findNotificationsByUserId', () => {
    it('should find and format notifications for a user', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const pagination = { limit: 10, offset: 0 };

      // Act
      const result = await notificationService.findNotificationsByUserId(
        userId,
        pagination
      );

      // Assert
      expect(notificationRepository.find).toHaveBeenCalled();
      expect(notificationRepository.countDocuments).toHaveBeenCalled();
      expect(result.notifications.length).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should apply read filter when provided', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const pagination = { limit: 10, offset: 0 };
      const filter = { read: false };

      // Act
      const result = await notificationService.findNotificationsByUserId(
        userId,
        pagination,
        filter
      );

      // Assert
      expect(notificationRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ read: false }),
        expect.any(Object)
      );
      expect(result.notifications.length).toBe(1);
    });

    it('should handle ObjectId user ID input', async () => {
      // Arrange
      const userIdObject = mockUserId;
      const pagination = { limit: 10, offset: 0 };

      // Act
      const result = await notificationService.findNotificationsByUserId(
        userIdObject,
        pagination
      );

      // Assert
      expect(notificationRepository.find).toHaveBeenCalled();
      expect(result.notifications.length).toBe(1);
    });

    it('should throw an error when repository find fails', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const pagination = { limit: 10, offset: 0 };

      // Mock repository to throw error
      notificationRepository.find.mockRejectedValueOnce(mockDbError);

      // Act & Assert
      await expect(
        notificationService.findNotificationsByUserId(userId, pagination)
      ).rejects.toThrow('Database error');
    });
  });

  // Test formatNotifications private method indirectly through getNotificationsForUser
  describe('formatNotifications (indirectly)', () => {
    it('should get actor details for notifications', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const limit = 10;
      const offset = 0;

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockActorId.toHexString()
      );
      expect(result.notifications[0]).toHaveProperty('actor');
      expect(result.notifications[0].actor).toHaveProperty(
        'username',
        'testuser'
      );
    });

    it('should handle missing actor ID in notification', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const limit = 10;
      const offset = 0;

      // Create notification without actorUserId
      const notificationWithoutActor = {
        ...mockDbNotification,
        actorUserId: undefined,
      };

      // Mock repository to return notification without actor
      notificationRepository.findByRecipient.mockResolvedValueOnce({
        notifications: [notificationWithoutActor],
        total: 1,
      });

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(actorService.getActorById).not.toHaveBeenCalled();
      expect(result.notifications[0]).not.toHaveProperty('actor');
    });

    it('should handle actor service returning null', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const limit = 10;
      const offset = 0;

      // Mock actorService to return null
      actorService.getActorById.mockResolvedValueOnce(null);

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(actorService.getActorById).toHaveBeenCalled();
      expect(result.notifications[0]).not.toHaveProperty('actor');
    });

    it('should handle actor service throwing an error', async () => {
      // Arrange
      const userId = mockUserId.toHexString();
      const limit = 10;
      const offset = 0;

      // Mock actorService to throw error
      actorService.getActorById.mockRejectedValueOnce(
        new Error('Actor service error')
      );

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(actorService.getActorById).toHaveBeenCalled();
      // Should still return notification but without actor
      expect(result.notifications.length).toBe(1);
      expect(result.notifications[0]).not.toHaveProperty('actor');
    });
  });
});
