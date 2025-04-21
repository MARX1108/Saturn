'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
beforeEach(() => {
  global.mockAuthService.mockReset();
  global.mockActorService.mockReset();
});
describe('Actor Routes', () => {
  describe('GET /api/actors/search (was GET /api/actors)', () => {
    it('should return actors via search endpoint (empty query)', async () => {
      const mockDate = new Date();
      const mockActor = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: mockDate,
        updatedAt: mockDate,
      };
      global.mockActorService.searchActors.mockResolvedValue({
        actors: [mockActor],
        hasMore: false,
      });
      const response = await global
        .request(global.testApp)
        .get('/api/actors/search?q=')
        .set('Authorization', 'Bearer mock-test-token');
      expect(response.status).toBe(200);
      expect(response.body.actors).toBeDefined();
      expect(Array.isArray(response.body.actors)).toBe(true);
      expect(global.mockActorService.searchActors).toHaveBeenCalledWith('');
    });
  });
  describe('GET /api/actors/search', () => {
    it('should search actors with a query', async () => {
      const mockActors = [
        { id: '1', name: 'Actor 1' },
        { id: '2', name: 'Actor 2' },
      ];
      global.mockActorService.searchActors.mockResolvedValue(mockActors);
      const response = await global
        .request(global.testApp)
        .get('/api/actors/search')
        .query({ q: 'test' })
        .expect(200);
      expect(response.body).toEqual(mockActors);
      expect(global.mockActorService.searchActors).toHaveBeenCalledWith('test');
    });
  });
  describe('GET /api/actors/:username', () => {
    it('should return an actor by username', async () => {
      const mockActor = { id: '1', username: 'testactor' };
      global.mockActorService.getActorByUsername.mockResolvedValue(mockActor);
      const response = await global
        .request(global.testApp)
        .get('/api/actors/testactor')
        .expect(200);
      expect(response.body).toEqual(mockActor);
      expect(global.mockActorService.getActorByUsername).toHaveBeenCalledWith(
        'testactor'
      );
    });
    it('should return 404 if actor not found', async () => {
      global.mockActorService.getActorByUsername.mockResolvedValue(null);
      await global
        .request(global.testApp)
        .get('/api/actors/nonexistent')
        .expect(404);
    });
  });
});
