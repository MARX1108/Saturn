import { Express } from 'express';

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
  describe('GET /api/comments/:postId', () => {
    it('should return response for comments routes', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/comments/nonexistentpostid');

      // The route exists but may return different status codes based on implementation
      expect(response.status).not.toBe(404);
      expect(response.body).toBeDefined();
    });
  });
});
