import { ObjectId } from 'mongodb';
import { jest } from '@jest/globals';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { PostService } from '@/modules/posts/services/postService';
import { ActorService } from '@/modules/actors/services/actorService';
import {
  Notification,
  NotificationType,
  FormattedNotification,
  CreateNotificationDto,
} from '@/modules/notifications/models/notification';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import {
  Db,
  Collection,
  UpdateResult,
  OptionalUnlessRequiredId,
  WithId,
  Filter,
} from 'mongodb';

// Mock dependencies
jest.mock('@/modules/notifications/repositories/notification.repository');
jest.mock('@/modules/posts/services/postService');
jest.mock('@/modules/actors/services/actorService');
jest.mock('mongodb');

// Helper function to create a Jest Mocked object with correct typing
const createMock = <T extends object>(): jest.Mocked<T> => {
  return {} as jest.Mocked<T>;
};

describe('NotificationService', () => {
  // Setup mocks
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection<Notification>>;
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

  // Use WithId for objects that come from the database
  const mockActor: WithId<Actor> = {
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

  const mockPost: WithId<Post> = {
    _id: mockPostId,
    id: 'https://example.com/posts/123',
    type: 'Note',
    actorId: mockActorId, // Should be ObjectId if linking directly
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

  const mockDbNotification: WithId<Notification> = {
    _id: mockNotificationId,
    type: NotificationType.LIKE,
    actorUserId: mockActorId.toString(),
    recipientUserId: mockUserId.toString(),
    postId: mockPostId.toString(),
    read: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockFormattedNotification: FormattedNotification = {
    id: mockDbNotification._id.toHexString(),
    type: mockDbNotification.type,
    actorUserId: mockDbNotification.actorUserId,
    recipientUserId: mockDbNotification.recipientUserId,
    postId: mockDbNotification.postId,
    read: mockDbNotification.read,
    createdAt: mockDbNotification.createdAt,
    updatedAt: mockDbNotification.updatedAt,
    actor: {
      id: mockActor._id.toHexString(), // Use ObjectId here
      username: mockActor.preferredUsername,
      displayName: mockActor.displayName,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // --- Mock DB and Collection --- //
    mockCollection = {
      createIndex: jest.fn(),
      updateMany: jest.fn(),
      find: jest.fn(),
      sort: jest.fn(),
      skip: jest.fn(),
      limit: jest.fn(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
    } as unknown as jest.Mocked<Collection<Notification>>;

    // Set default resolved values for collection methods
    mockCollection.createIndex.mockResolvedValue('index_name');
    mockCollection.updateMany.mockResolvedValue({
      acknowledged: true,
      modifiedCount: 1,
      upsertedId: null,
      upsertedCount: 0,
      matchedCount: 1,
    });
    // Make find chainable
    const findResult = {
      sort: mockCollection.sort,
      skip: mockCollection.skip,
      limit: mockCollection.limit,
      toArray: mockCollection.toArray,
    };
    mockCollection.find.mockReturnValue(findResult as any);
    mockCollection.sort.mockReturnThis();
    mockCollection.skip.mockReturnThis();
    mockCollection.limit.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([mockDbNotification]);
    mockCollection.countDocuments.mockResolvedValue(1);

    mockDb = { collection: jest.fn() } as unknown as jest.Mocked<Db>;
    mockDb.collection.mockReturnValue(mockCollection);

    // --- Mock Repositories and Services --- //
    notificationRepository = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByRecipient: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      getUnreadCount: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepository>;

    // Set default resolved values for repository methods
    notificationRepository.create.mockImplementation(async data => ({
      _id: new ObjectId(),
      ...(data as Notification), // Assuming data is Notification compatible
      read: data.read ?? false,
      createdAt: data.createdAt ?? mockDate,
      updatedAt: data.updatedAt ?? mockDate,
    }));
    notificationRepository.findByRecipient.mockResolvedValue({
      notifications: [mockDbNotification],
      total: 1,
    });
    notificationRepository.markAsRead.mockResolvedValue({ modifiedCount: 1 });
    notificationRepository.markAllAsRead.mockResolvedValue({
      modifiedCount: 1,
    });
    notificationRepository.getUnreadCount.mockResolvedValue(3);

    postService = { getPostById: jest.fn() } as jest.Mocked<PostService>;
    postService.getPostById.mockResolvedValue(mockPost);

    actorService = { getActorById: jest.fn() } as jest.Mocked<ActorService>;
    actorService.getActorById.mockResolvedValue(mockActor);

    // --- Instantiate Service and Mock Getters --- //
    notificationService = new NotificationService(mockDb, actorService);
    notificationService.setPostService(postService);

    // Mock the repository and collection getters
    Object.defineProperty(notificationService, 'repository', {
      get: jest.fn(() => notificationRepository),
      configurable: true,
    });
    Object.defineProperty(notificationService, 'collection', {
      get: jest.fn(() => mockCollection),
      configurable: true,
    });

    // Mock Date and Time
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    Date.now = jest.fn(() => mockTimestamp);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- Test Cases --- //

  describe('createNotification', () => {
    it('should create a like notification successfully', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        type: NotificationType.LIKE,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
      };
      const expectedRepoInput = {
        ...notificationData,
        read: false, // Service adds defaults
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      // Service transforms DTO before calling repo
      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(notificationData)
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty('_id');
      expect(result).toMatchObject(expectedRepoInput); // Check against expected Repo input + _id
    });

    it('should create a comment notification successfully', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        type: NotificationType.COMMENT,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
        commentId: mockCommentId.toString(),
      };
      const expectedRepoInput = {
        ...notificationData,
        read: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(notificationData)
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty('_id');
      expect(result).toMatchObject(expectedRepoInput);
    });

    it('should create a follow notification successfully', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        type: NotificationType.FOLLOW,
        actorUserId: mockActorId.toString(),
        recipientUserId: mockUserId.toString(),
      };
      const expectedRepoInput = {
        ...notificationData,
        read: false,
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(notificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(notificationData)
      );
      expect(result).toBeDefined();
      expect(result).toHaveProperty('_id');
      expect(result).toMatchObject(expectedRepoInput);
    });

    it('should not create notification if actor is the same as recipient', async () => {
      // Arrange
      const notificationData: CreateNotificationDto = {
        type: NotificationType.LIKE,
        actorUserId: mockUserId.toString(),
        recipientUserId: mockUserId.toString(),
        postId: mockPostId.toString(),
      };

      // Act
      const result =
        await notificationService.createNotification(notificationData);

      // Assert
      expect(result).toBeNull();
      expect(notificationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getNotificationsForUser', () => {
    it('should return formatted notifications for a user with pagination', async () => {
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
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockDbNotification.actorUserId
      );
      expect(result.total).toBe(1);
      expect(result.limit).toBe(limit);
      expect(result.offset).toBe(offset);
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]).toMatchObject(mockFormattedNotification);
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
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockDbNotification.actorUserId
      );
      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]).toMatchObject(mockFormattedNotification);
    });

    it('should handle case where actor cannot be found during formatting', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const limit = 10;
      const offset = 0;
      actorService.getActorById.mockResolvedValueOnce(null); // Actor not found

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(notificationRepository.findByRecipient).toHaveBeenCalled();
      expect(actorService.getActorById).toHaveBeenCalledWith(
        mockDbNotification.actorUserId
      );
      const expectedFormattedWithoutActor = { ...mockFormattedNotification };
      delete expectedFormattedWithoutActor.actor; // Remove actor property for comparison
      expect(result.notifications[0]).toMatchObject(
        expectedFormattedWithoutActor
      );
      expect(result.notifications[0].actor).toBeUndefined();
    });

    it('should handle empty results from repository', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const limit = 10;
      const offset = 0;
      notificationRepository.findByRecipient.mockResolvedValueOnce({
        notifications: [],
        total: 0,
      });

      // Act
      const result = await notificationService.getNotificationsForUser(userId, {
        limit,
        offset,
      });

      // Assert
      expect(notificationRepository.findByRecipient).toHaveBeenCalled();
      expect(actorService.getActorById).not.toHaveBeenCalled();
      expect(result.notifications).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('markNotificationsAsRead', () => {
    it('should mark specific notifications as read using the collection', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const notificationIds = [mockNotificationId.toString()];
      const expectedFilter: Filter<Notification> = {
        recipientUserId: userId,
        read: false,
        _id: { $in: notificationIds.map(id => new ObjectId(id)) },
      };
      const expectedUpdate = { $set: { read: true, updatedAt: mockDate } };

      // Act
      const result = await notificationService.markNotificationsAsRead(
        userId,
        notificationIds
      );

      // Assert
      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        expectedFilter,
        expectedUpdate
      );
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });

    it('should mark all notifications as read if no IDs are provided', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const expectedFilter: Filter<Notification> = {
        recipientUserId: userId,
        read: false,
      };
      const expectedUpdate = { $set: { read: true, updatedAt: mockDate } };

      // Act
      const result = await notificationService.markNotificationsAsRead(userId);

      // Assert
      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        expectedFilter,
        expectedUpdate
      );
      expect(result).toEqual({ acknowledged: true, modifiedCount: 1 });
    });

    it('should handle ObjectId input for userId', async () => {
      // Arrange
      const userIdObject = mockUserId;
      const expectedFilter: Filter<Notification> = {
        recipientUserId: userIdObject.toHexString(), // Service converts ObjectId
        read: false,
      };
      const expectedUpdate = { $set: { read: true, updatedAt: mockDate } };

      // Act
      await notificationService.markNotificationsAsRead(userIdObject); // No notification IDs

      // Assert
      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        expectedFilter,
        expectedUpdate
      );
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read using the repository', async () => {
      // Arrange
      const userId = mockUserId.toString();

      // Act
      const result =
        await notificationService.markAllNotificationsAsRead(userId);

      // Assert
      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it('should return false if no notifications were updated by repository', async () => {
      // Arrange
      const userId = mockUserId.toString();
      notificationRepository.markAllAsRead.mockResolvedValueOnce({
        modifiedCount: 0,
      });

      // Act
      const result =
        await notificationService.markAllNotificationsAsRead(userId);

      // Assert
      expect(notificationRepository.markAllAsRead).toHaveBeenCalledWith(userId);
      expect(result).toBe(false);
    });
  });

  describe('getUnreadNotificationCount', () => {
    it('should return the count of unread notifications', async () => {
      // Arrange
      const userId = mockUserId.toString();
      const mockCount = 3;
      notificationRepository.getUnreadCount.mockResolvedValueOnce(mockCount);

      // Act
      const result =
        await notificationService.getUnreadNotificationCount(userId);

      // Assert
      expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(mockCount);
    });

    it('should return 0 if there are no unread notifications', async () => {
      // Arrange
      const userId = mockUserId.toString();
      notificationRepository.getUnreadCount.mockResolvedValueOnce(0);

      // Act
      const result =
        await notificationService.getUnreadNotificationCount(userId);

      // Assert
      expect(notificationRepository.getUnreadCount).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(0);
    });
  });
});
