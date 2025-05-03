import { Pact, Matchers, InteractionObject } from '@pact-foundation/pact';
import { ApiEndpoints } from '../config/api';
import { fetchFeedPosts } from './postService';
import apiClient from './apiClient';
import * as tokenStorage from './tokenStorage';
import path from 'path';

// Create a dedicated pact provider for this test suite with a unique port
const pactProvider = new Pact({
  consumer: 'SaturnIOSApp',
  provider: 'SaturnAPI',
  port: 1235, // Use a unique port different from other test suites
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn',
  spec: 2,
});

describe('API Pact Tests - Post Service', () => {
  // Setup
  beforeAll(() => pactProvider.setup());
  // No verify in afterEach, we'll manually verify in each test
  // Tear down
  afterAll(() => pactProvider.finalize());

  describe('Fetching Feed Posts', () => {
    // Mock token for authorization
    const mockToken = 'test-auth-token';

    // Constants for the test
    const postAuthor = {
      _id: Matchers.string('authorId123'),
      id: Matchers.string('authorId123'),
      username: 'testuser',
      displayName: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    // Define post structure using matchers for flexibility
    const post = {
      _id: Matchers.string('postId123'),
      id: Matchers.string('postId123'),
      content: Matchers.string('This is a test post content'),
      createdAt: Matchers.iso8601DateTime('2024-01-01T12:00:00Z'),
      author: postAuthor,
      likeCount: Matchers.integer(5),
      liked: Matchers.boolean(false),
    };

    // Expected response for feed posts
    const feedPostsResponse = {
      posts: [post],
      hasMore: false,
    };

    // Define the interaction
    const interaction: InteractionObject = {
      state: 'User has feed posts',
      uponReceiving: 'a request to get feed posts',
      withRequest: {
        method: 'GET',
        path: ApiEndpoints.posts,
        headers: {
          Authorization: `Bearer ${mockToken}`,
          Accept: 'application/json, text/plain, */*',
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: feedPostsResponse,
      },
    };

    it('returns feed posts on success', async () => {
      // Add the interaction to the mock server
      await pactProvider.addInteraction(interaction);

      // Mock the token retrieval
      jest.spyOn(tokenStorage, 'getToken').mockResolvedValue(mockToken);

      // Store original baseURL
      const originalBaseURL = apiClient.defaults.baseURL;

      // Set the baseURL to the mock server
      apiClient.defaults.baseURL = `http://localhost:1235`;

      try {
        // Make the API call
        const posts = await fetchFeedPosts();

        // Assertions
        expect(posts).toBeInstanceOf(Array);
        expect(posts).toHaveLength(1);
        expect(posts[0].id).toBe('postId123');
        expect(posts[0].content).toBe('This is a test post content');
        expect(posts[0].author.username).toBe('testuser');
      } finally {
        // Reset the baseURL
        apiClient.defaults.baseURL = originalBaseURL;
      }

      // Verify this test's interactions
      await pactProvider.verify();
    });
  });
});
