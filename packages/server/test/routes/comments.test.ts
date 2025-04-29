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

describe('Comment Routes', () => {
  let testUserId: string;
  let testUserToken: string;
  const testPostId = '60a0f3f1e1b8f1a1a8b4c1c3'; // Using known test post ID
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

  describe('GET /api/comments/:postId', () => {
    it('should return comments for a post', async () => {
      const response = await global
        .request(global.testApp)
        .get(`/api/comments/${testPostId}`);

      // The route should return a 200 with comments (even if empty)
      expect(response.status).toBe(200);
      expect(response.body).toBeDefined();
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    it('should handle invalid post ID format', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/comments/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/comments', () => {
    it('should create a new comment when authenticated and data is valid', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          postId: testPostId,
          content: 'This is a test comment',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('content', 'This is a test comment');
      expect(response.body).toHaveProperty('postId', testPostId);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .send({
          postId: testPostId,
          content: 'This is a test comment',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when using an invalid token format', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', 'InvalidTokenFormat')
        .send({
          postId: testPostId,
          content: 'This is a test comment',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when content is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          postId: testPostId,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when content is empty', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          postId: testPostId,
          content: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when postId is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'This is a test comment',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when postId is invalid', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          postId: 'invalid-id',
          content: 'This is a test comment',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/comments/:id', () => {
    it('should delete a comment when authenticated and authorized', async () => {
      // First create a comment to get its ID
      const createResponse = await global
        .request(global.testApp)
        .post('/api/comments')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          postId: testPostId,
          content: 'This is a test comment to delete',
        });

      expect(createResponse.status).toBe(201);
      const commentId = createResponse.body._id;

      // Now delete the comment
      const deleteResponse = await global
        .request(global.testApp)
        .delete(`/api/comments/${commentId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty(
        'message',
        'Comment deleted successfully'
      );
    });

    it('should return 401 when not authenticated', async () => {
      const commentId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .delete(`/api/comments/${commentId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when comment ID is invalid', async () => {
      const response = await global
        .request(global.testApp)
        .delete('/api/comments/invalid-id')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 when comment does not exist', async () => {
      const nonExistentId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .delete(`/api/comments/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
