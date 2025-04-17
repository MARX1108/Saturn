import { mockPostService, mockPostsController } from '../helpers/testApp';

// Mock token for authentication
const mockToken = 'mock-test-token';

beforeEach(() => {
  // Reset mocks before each test
  mockPostService.mockReset();
  mockPostsController.mockReset();
});

describe('Post Routes', () => {
  describe('GET /api/posts', () => {
    it('should return posts feed', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
      ];
      mockPostsController.getFeed.mockResolvedValue(mockPosts);

      const response = await global
        .request(global.testApp)
        .get('/api/posts')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(mockPostsController.getFeed).toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      console.log('!!! DEBUG: Starting getPostById test');
      const post = await createTestPost();
      console.log('!!! DEBUG: Created test post with id:', post.id);

      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${post.id}`)
        .set('Authorization', `Bearer ${mockToken}`);

      console.log('!!! DEBUG: Response status:', response.status);
      console.log('!!! DEBUG: Response body:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(post.id);
    });

    it('should return 404 if post not found', async () => {
      console.log('!!! DEBUG: Starting getPostById 404 test');
      const response = await global
        .request(global.testApp)
        .get('/api/posts/nonexistent')
        .set('Authorization', `Bearer ${mockToken}`);

      console.log('!!! DEBUG: Response status:', response.status);
      console.log('!!! DEBUG: Response body:', response.body);

      expect(response.status).toBe(404);
    });
  });
});
