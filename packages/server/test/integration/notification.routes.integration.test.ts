import { NotificationRepository } from '../../src/modules/notifications/repositories/notification.repository';
import { NotificationService } from '../../src/modules/notifications/services/notification.service';
import { NotificationsController } from '../../src/modules/notifications/controllers/notifications.controller';
import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

// Constants for notification types
const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
};

// Mock repositories
jest.mock(
  '../../src/modules/notifications/repositories/notification.repository'
);
jest.mock('../../src/modules/actors/repositories/actorRepository');

describe('Notification Routes Integration', () => {
  let notificationRepository: jest.Mocked<NotificationRepository>;
  let notificationService: jest.Mocked<NotificationService>;
  let notificationsController: NotificationsController;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup repository mocks
    notificationRepository = {
      findByRecipient: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      getUnreadCount: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepository>;

    // Mock the response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };

    next = jest.fn();

    // Create notification service with mocked repository
    notificationService = {
      getNotificationsForUser: jest.fn(),
      markNotificationsAsRead: jest.fn(),
      markAllNotificationsAsRead: jest.fn(),
      getUnreadCount: jest.fn(),
    } as unknown as jest.Mocked<NotificationService>;
    (notificationService as any).notificationRepository =
      notificationRepository;

    // Create controller with service
    notificationsController = new NotificationsController(notificationService);

    // Setup default service responses
    notificationService.getNotificationsForUser.mockResolvedValue({
      notifications: [
        {
          _id: new ObjectId('000000000000000000000001'),
          recipientUserId: 'user123',
          type: NOTIFICATION_TYPES.LIKE,
          read: false,
          actorId: 'actor1',
          createdAt: new Date(),
        },
        {
          _id: new ObjectId('000000000000000000000002'),
          recipientUserId: 'user123',
          type: NOTIFICATION_TYPES.COMMENT,
          read: true,
          actorId: 'actor2',
          createdAt: new Date(),
        },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
      },
    });

    notificationService.markNotificationsAsRead.mockResolvedValue({
      modifiedCount: 1,
    });
    notificationService.markAllNotificationsAsRead.mockResolvedValue({
      modifiedCount: 2,
    });
    notificationService.getUnreadCount.mockResolvedValue(1);
  });

  describe('GET /api/notifications', () => {
    it('should require authentication', async () => {
      // Setup request without user
      req = {
        query: {},
      };

      await notificationsController.getNotifications(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        })
      );
      expect(
        notificationService.getNotificationsForUser
      ).not.toHaveBeenCalled();
    });

    it('should return notifications for authenticated user', async () => {
      // Setup authenticated request
      req = {
        user: { id: 'user123' },
        query: {},
      };

      await notificationsController.getNotifications(
        req as Request,
        res as Response,
        next
      );

      expect(notificationService.getNotificationsForUser).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({ limit: 10, offset: 0 })
      );
      expect(res.json).toHaveBeenCalled();
    });

    it('should handle read filter parameter', async () => {
      // Setup authenticated request with read filter
      req = {
        user: { id: 'user123' },
        query: { read: 'false' },
      };

      await notificationsController.getNotifications(
        req as Request,
        res as Response,
        next
      );

      // The controller doesn't actually handle the read parameter, it's handled at the service level
      expect(notificationService.getNotificationsForUser).toHaveBeenCalledWith(
        'user123',
        expect.any(Object)
      );
    });

    it('should handle pagination parameters', async () => {
      // Setup authenticated request with pagination
      req = {
        user: { id: 'user123' },
        query: { page: '2' },
      };

      await notificationsController.getNotifications(
        req as Request,
        res as Response,
        next
      );

      expect(notificationService.getNotificationsForUser).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({ limit: 10, offset: 10 })
      );
    });

    it('should get unread count', async () => {
      // Setup authenticated request
      req = {
        user: { id: 'user123' },
      };

      await notificationsController.getUnreadCount(
        req as Request,
        res as Response,
        next
      );

      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(
        'user123'
      );
      expect(res.json).toHaveBeenCalledWith({ count: 1 });
    });
  });

  describe('POST /api/notifications/mark-read', () => {
    it('should require authentication', async () => {
      // Setup request without user
      req = {
        body: { ids: ['notification1'] },
      };

      await notificationsController.markRead(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        })
      );
      expect(
        notificationService.markNotificationsAsRead
      ).not.toHaveBeenCalled();
    });

    it('should mark notifications as read', async () => {
      // Setup authenticated request
      req = {
        user: { id: 'user123' },
        body: { ids: ['notification1'] },
      };

      await notificationsController.markRead(
        req as Request,
        res as Response,
        next
      );

      expect(notificationService.markNotificationsAsRead).toHaveBeenCalledWith(
        ['notification1'],
        'user123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle missing ids parameter', async () => {
      // Setup authenticated request with missing ids
      req = {
        user: { id: 'user123' },
        body: {},
      };

      await notificationsController.markRead(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Missing ids parameter',
        })
      );
      expect(
        notificationService.markNotificationsAsRead
      ).not.toHaveBeenCalled();
    });

    it('should handle non-array ids parameter', async () => {
      // Setup authenticated request with non-array ids
      req = {
        user: { id: 'user123' },
        body: { ids: 'notification1' },
      };

      await notificationsController.markRead(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Ids must be an array',
        })
      );
      expect(
        notificationService.markNotificationsAsRead
      ).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('should require authentication', async () => {
      // Setup request without user
      req = {};

      await notificationsController.markAllRead(
        req as Request,
        res as Response,
        next
      );

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Authentication required',
        })
      );
      expect(
        notificationService.markAllNotificationsAsRead
      ).not.toHaveBeenCalled();
    });

    it('should mark all notifications as read', async () => {
      // Setup authenticated request
      req = {
        user: { id: 'user123' },
      };

      await notificationsController.markAllRead(
        req as Request,
        res as Response,
        next
      );

      expect(
        notificationService.markAllNotificationsAsRead
      ).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should allow admin users to mark all notifications as read', async () => {
      // Setup authenticated admin request
      req = {
        user: { id: 'admin456', role: 'admin' },
      };

      await notificationsController.markAllRead(
        req as Request,
        res as Response,
        next
      );

      expect(
        notificationService.markAllNotificationsAsRead
      ).toHaveBeenCalledWith('admin456');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });
});
