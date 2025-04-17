import { PostService } from '../../src/modules/posts/services/postService';
import { ActorService } from '../../src/modules/actors/services/actorService';
import { AuthService } from '../../src/modules/auth/services/authService';
import { CommentService } from '../../src/modules/comments/services/commentService';
import { mock } from 'jest-mock-extended';

// Mock the services
const mockPostService = mock<PostService>();
const mockActorService = mock<ActorService>();
const mockAuthService = mock<AuthService>();
const mockCommentService = mock<CommentService>();

// Setup and cleanup
beforeAll(() => {
  // Configure the test app with the mock services
  global.testApp.use((req, res, next) => {
    req.services = {
      postService: mockPostService,
      actorService: mockActorService,
      authService: mockAuthService,
      commentService: mockCommentService,
    };
    next();
  });
});

beforeEach(() => {
  // Reset mocks before each test
  mockPostService.mockReset();
  mockActorService.mockReset();
  mockAuthService.mockReset();
  mockCommentService.mockReset();
});

describe('Post Routes', () => {
  describe('GET /api/posts/trending', () => {
    it('should return trending posts', async () => {
      const mockPosts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
      ];
      mockPostService.getTrendingPosts.mockResolvedValue(mockPosts);

      const response = await global
        .request(global.testApp)
        .get('/api/posts/trending')
        .expect(200);

      expect(response.body).toEqual(mockPosts);
      expect(mockPostService.getTrendingPosts).toHaveBeenCalled();
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a post by id', async () => {
      const mockPost = { id: '1', title: 'Test Post' };
      mockPostService.getPostById.mockResolvedValue(mockPost);

      const response = await global
        .request(global.testApp)
        .get('/api/posts/1')
        .expect(200);

      expect(response.body).toEqual(mockPost);
      expect(mockPostService.getPostById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if post not found', async () => {
      mockPostService.getPostById.mockResolvedValue(null);

      await global
        .request(global.testApp)
        .get('/api/posts/nonexistent')
        .expect(404);
    });
  });
});
