import { createTestApp } from '../helpers/testApp';
import { createTestPost } from '../helpers/testUtils';
import request from 'supertest';

describe('Post Routes', () => {
  const app = createTestApp();

  describe('GET /api/posts', () => {
    it('should return posts feed', async () => {
      const response = await request(app)
        .get('/api/posts')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const post = await createTestPost();

      const response = await request(app)
        .get(`/api/posts/${post.id}`)
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(post.id);
    });

    it('should return 404 if post not found', async () => {
      const response = await request(app)
        .get('/api/posts/nonexistent')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(404);
    });
  });
});
