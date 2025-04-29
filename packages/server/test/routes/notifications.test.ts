import { Express } from 'express';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

// Access the globally available app and db from setup.ts
declare global {
  // eslint-disable-next-line no-var
  var testApp: Express;
  // eslint-disable-next-line no-var
  var request: (
    app: Express
  ) => import('supertest').SuperTest<import('supertest').Test>;
}

describe('Notification Routes', () => {
  let testUserId: string;
  let testUserToken: string;
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';

  beforeEach(() => {
    // Create a test user ID
    testUserId = new ObjectId().toString();

    // Generate a token for the test user
    testUserToken = jwt.sign(
      { id: testUserId, username: 'testuser' },
      jwtSecret
    );
  });

  describe('GET /api/notifications', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 status when using an invalid token', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 status when using a malformed authorization header', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return notifications when authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.notifications)).toBe(true);
    });

    it('should accept valid page parameter', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications?page=2')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle invalid page parameter', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications?page=invalid')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications/unread-count');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 status when token is expired', async () => {
      // Create an expired token (issued 2 hours ago, expires in 1 hour)
      const expiredToken = jwt.sign(
        {
          id: testUserId,
          username: 'testuser',
          iat: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        },
        jwtSecret
      );

      const response = await global
        .request(global.testApp)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return unread count when authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(typeof response.body.count).toBe('number');
    });
  });

  describe('POST /api/notifications/mark-read', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-read')
        .send({ ids: ['testnotificationid'] });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should mark notifications as read when authenticated', async () => {
      const notificationIds = [
        new ObjectId().toString(),
        new ObjectId().toString(),
      ];

      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ ids: notificationIds });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when ids array is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when ids is not an array', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ ids: 'not-an-array' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-all-read');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should mark all notifications as read when authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });
});
