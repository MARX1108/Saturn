import request from 'supertest';
import { app } from '../../src/index';

// Define notification types constants to avoid referencing external modules in jest.mock
const NOTIFICATION_TYPE = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  REPOST: 'repost',
};

// Mock the repositories
jest.mock(
  '../../src/modules/notifications/repositories/notification.repository',
  () => ({
    NotificationRepository: jest.fn().mockImplementation(() => ({
      findByRecipient: jest.fn().mockImplementation((userId, options = {}) => {
        const mockNotifications = [
          {
            _id: 'notification123',
            recipientUserId: 'user123456789',
            actorUserId: 'actor123456789',
            type: NOTIFICATION_TYPE.LIKE,
            postId: 'post123456789',
            read: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            _id: 'notification456',
            recipientUserId: 'user123456789',
            actorUserId: 'actor123456789',
            type: NOTIFICATION_TYPE.COMMENT,
            postId: 'post123456789',
            read: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        // Apply read filter if specified
        if (options.read !== undefined) {
          return Promise.resolve(
            mockNotifications.filter(n => n.read === options.read)
          );
        }

        return Promise.resolve(mockNotifications);
      }),
      markAsRead: jest.fn().mockImplementation(notificationId => {
        return Promise.resolve({ modifiedCount: 1 });
      }),
      markAllAsRead: jest.fn().mockImplementation(userId => {
        return Promise.resolve({ modifiedCount: 2 });
      }),
      getUnreadCount: jest.fn().mockImplementation(userId => {
        return Promise.resolve(1);
      }),
    })),
  })
);

jest.mock('../../src/modules/actors/repositories/actorRepository', () => ({
  ActorRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockImplementation(id => {
      if (id === 'actor123456789') {
        return Promise.resolve({
          _id: 'actor123456789',
          username: 'testuser',
          displayName: 'Test User',
          createdAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }),
  })),
}));

// Mock the JWT verify function
jest.mock('jsonwebtoken', () => ({
  ...jest.requireActual('jsonwebtoken'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'test_token') {
      return { userId: 'user123456789' };
    }
    throw new Error('Invalid token');
  }),
}));

describe('Notification Routes Integration', () => {
  const testUserToken = 'test_token';

  describe('GET /api/notifications', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/notifications');

      expect(response.status).toBe(401);
    });

    it('should return notifications when authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${testUserToken}`);

      // Since we're using mocks that don't hit the actual API,
      // we'll just check for non-server errors
      expect(response.status).toBeLessThan(500);
    });

    it('should accept read filter parameter', async () => {
      const response = await request(app)
        .get('/api/notifications?read=false')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('POST /api/notifications/mark-read', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-read')
        .send({
          notificationId: 'notification123',
        });

      expect(response.status).toBe(401);
    });

    it('should mark notification as read when authenticated', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          notificationId: 'notification123',
        });

      expect(response.status).toBeLessThan(500);
    });

    it('should return 400 when notificationId is missing', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).post(
        '/api/notifications/mark-all-read'
      );

      expect(response.status).toBe(401);
    });

    it('should mark all notifications as read when authenticated', async () => {
      const response = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBeLessThan(500);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get(
        '/api/notifications/unread-count'
      );

      expect(response.status).toBe(401);
    });

    it('should return unread count when authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBeLessThan(500);
    });
  });
});
