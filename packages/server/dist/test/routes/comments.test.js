'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
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
