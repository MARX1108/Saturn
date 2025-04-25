'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
describe('Notification Routes', () => {
  describe('GET /api/notifications', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications');
      expect(response.status).toBe(401);
    });
  });
  describe('GET /api/notifications/unread-count', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/notifications/unread-count');
      expect(response.status).toBe(401);
    });
  });
  describe('POST /api/notifications/mark-read', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-read')
        .send({ ids: ['testnotificationid'] });
      expect(response.status).toBe(401);
    });
  });
  describe('POST /api/notifications/mark-all-read', () => {
    it('should return 401 status when not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/notifications/mark-all-read');
      expect(response.status).toBe(401);
    });
  });
});
