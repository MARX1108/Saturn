import request from 'supertest';
import { jest } from '@jest/globals';
import { mockActorService, mockPostService } from '../helpers/mockSetup'; // Import mocks
import { Post } from '@/modules/posts/models/post'; // Import Post type
import { Actor } from '@/modules/actors/models/actor'; // Import Actor type

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Post Routes', () => {
  // Define base mock objects
  const mockDate = new Date();
  // Define mock author matching Actor type
  const mockAuthor: Actor = {
    _id: '60a0f3f1e1b8f1a1a8b4c1c1', // String ID
    id: 'https://test.domain/users/testuser',
    username: 'testuser@test.domain',
    preferredUsername: 'testuser',
    displayName: 'Test User',
    name: 'Test User',
    bio: 'Test bio',
    summary: 'Test summary',
    type: 'Person' as const,
    inbox: 'https://test.domain/users/testuser/inbox',
    outbox: 'https://test.domain/users/testuser/outbox',
    followers: 'https://test.domain/users/testuser/followers',
    createdAt: mockDate,
    updatedAt: mockDate,
    publicKey: {
      id: 'key-id',
      owner: 'https://test.domain/users/testuser',
      publicKeyPem: '---PUBLIC KEY---',
    },
  };
  // Define mock post matching Post type
  const fullMockPost: Post = {
    _id: '60a0f3f1e1b8f1a1a8b4c1c2', // String ID
    id: 'https://test.domain/posts/mockPostId',
    authorId: mockAuthor._id!, // Use authorId (string)
    content: 'Test post content',
    visibility: 'public',
    published: mockDate, // Use published
    updated: mockDate, // Use updated
    type: 'Note' as const,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [],
    attributedTo: mockAuthor.id,
    url: 'https://test.domain/posts/mockPostId',
    replies: [], // Should be string[]
    likes: [], // Should be string[]
    shares: 0,
    sensitive: false,
    contentWarning: undefined, // Match type string | undefined
    actor: {
      // Actor summary object
      id: mockAuthor.id,
      username: mockAuthor.preferredUsername, // Use preferredUsername to match type
    },
    attachments: [], // Optional
  };

  describe('GET /api/posts', () => {
    it('should return a list of posts', async () => {
      const mockFeedResult = {
        posts: [{ ...fullMockPost }], // Use a valid Post object
        hasMore: false,
      };
      // Controller calls postService.getFeed, then actorService.getActorById for each post
      mockPostService.getFeed.mockResolvedValue(mockFeedResult);
      mockActorService.getActorById.mockResolvedValue(mockAuthor); // Mock needed for formatPostResponse

      const response = await request((global as any).testApp)
        .get('/api/posts')
        .expect(200);

      // Assert based on the structure returned by formatPostResponse
      const expectedResponsePost = {
        id: fullMockPost.id,
        content: fullMockPost.content,
        author: {
          id: mockAuthor.id,
          username: mockAuthor.preferredUsername,
          displayName: mockAuthor.displayName,
          avatarUrl: mockAuthor.icon?.url, // Use icon?.url if available
        },
        createdAt: fullMockPost.published.toISOString(),
        sensitive: fullMockPost.sensitive,
        contentWarning: fullMockPost.contentWarning,
        likes: 0, // formatPostResponse calculates length
        likedByUser: false, // formatPostResponse calculates this
        shares: fullMockPost.shares,
        attachments: fullMockPost.attachments,
      };

      expect(response.body.posts[0]).toMatchObject(expectedResponsePost);
      expect(response.body.hasMore).toBe(false);
      expect(mockPostService.getFeed).toHaveBeenCalled();
      // Check actorService was called for the post in the feed
      expect(mockActorService.getActorById).toHaveBeenCalledWith(
        fullMockPost.actor.id
      );
    });

    it('should handle server errors during feed retrieval', async () => {
      // Mocking getFeed to reject should cause a 500
      mockPostService.getFeed.mockRejectedValue(new Error('Feed fetch failed'));

      await request((global as any).testApp)
        .get('/api/posts')
        .expect(500);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post by id', async () => {
      // Controller calls postService.getPostById, then actorService.getActorById
      mockPostService.getPostById.mockResolvedValue(fullMockPost);
      mockActorService.getActorById.mockResolvedValue(mockAuthor);

      const response = await request((global as any).testApp)
        .get(`/api/posts/${fullMockPost.id}`)
        .expect(200);

      // Assert based on formatPostResponse
      const expectedResponsePost = {
        id: fullMockPost.id,
        content: fullMockPost.content,
        author: {
          id: mockAuthor.id,
          username: mockAuthor.preferredUsername,
          displayName: mockAuthor.displayName,
          avatarUrl: mockAuthor.icon?.url,
        },
        createdAt: fullMockPost.published.toISOString(),
        likes: 0,
        likedByUser: false,
        shares: fullMockPost.shares,
      };
      expect(response.body).toMatchObject(expectedResponsePost);
      expect(mockPostService.getPostById).toHaveBeenCalledWith(fullMockPost.id);
      expect(mockActorService.getActorById).toHaveBeenCalledWith(
        fullMockPost.actor.id
      );
    });

    it('should return 404 if post not found', async () => {
      // Controller calls postService.getPostById, which returns null
      mockPostService.getPostById.mockResolvedValue(null);
      // actorService should not be called if post is null

      await request((global as any).testApp)
        .get('/api/posts/nonexistent')
        .expect(404); // Controller should return 404

      expect(mockActorService.getActorById).not.toHaveBeenCalled();
    });

    it('should handle server errors during single post retrieval', async () => {
      // Mock getPostById to reject
      mockPostService.getPostById.mockRejectedValue(
        new Error('Post fetch failed')
      );

      await request((global as any).testApp)
        .get(`/api/posts/${fullMockPost.id}`)
        .expect(500);
    });
  });

  // Add other describe blocks for POST, PUT, DELETE etc.
});
