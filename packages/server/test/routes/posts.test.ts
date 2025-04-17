import { mockPostService, mockPostsController } from '../helpers/testApp';

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
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(mockPostsController.getFeed).toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const mockPost = { id: '1', title: 'Test Post' };
      mockPostsController.getPostById.mockResolvedValue(mockPost);

      const response = await global
        .request(global.testApp)
        .get('/api/posts/1')
        .expect(200);

      expect(response.body).toEqual(mockPost);
      expect(mockPostsController.getPostById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if post not found', async () => {
      mockPostsController.getPostById.mockResolvedValue(null);

      await global
        .request(global.testApp)
        .get('/api/posts/nonexistent')
        .expect(404);
    });
  });
});
