import request from 'supertest';

beforeEach(() => {
  global.mockAuthService.mockReset();
  global.mockActorService.mockReset();
  global.mockPostService.mockReset();
});

describe('Post Routes', () => {
  describe('GET /api/posts', () => {
    it('should return posts feed', async () => {
      const mockDate = new Date();
      const mockActor = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockPost = {
        id: 'test-post-id',
        content: 'Test post content',
        authorId: 'test-user-id',
        createdAt: mockDate,
        updatedAt: mockDate,
        likes: [],
        shares: 0,
        sensitive: false,
        contentWarning: null,
        attachments: [],
        actor: mockActor,
      };

      global.mockPostService.getFeed.mockResolvedValue({
        posts: [mockPost],
        hasMore: false,
      });

      const response = await global
        .request(global.testApp)
        .get('/api/posts')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body.posts).toBeDefined();
      expect(Array.isArray(response.body.posts)).toBe(true);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const mockDate = new Date();
      const mockActor = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: mockDate,
        updatedAt: mockDate,
      };

      const mockPost = {
        id: 'test-post-id',
        content: 'Test post content',
        authorId: 'test-user-id',
        createdAt: mockDate,
        updatedAt: mockDate,
        likes: [],
        shares: 0,
        sensitive: false,
        contentWarning: null,
        attachments: [],
        actor: mockActor,
      };

      global.mockPostService.getPostById.mockResolvedValue(mockPost);
      global.mockActorService.findById.mockResolvedValue(mockActor);

      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${mockPost.id}`)
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(mockPost.id);
    });

    it('should return 404 if post not found', async () => {
      global.mockPostService.getPostById.mockResolvedValue(null);

      const response = await global
        .request(global.testApp)
        .get('/api/posts/nonexistent')
        .set('Authorization', 'Bearer mock-test-token');

      expect(response.status).toBe(404);
    });
  });
});
