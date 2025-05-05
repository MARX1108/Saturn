import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import { fetchFeedPosts, createPost } from './postService';
import mockApiClient from '../test/mockApiClient';
import * as tokenStorage from './tokenStorage';

// Mock the apiClient import in postService
/* eslint-disable @typescript-eslint/no-unsafe-return */
jest.mock('./apiClient', () => ({
  __esModule: true,
  ...jest.requireActual('../test/mockApiClient'),
}));
/* eslint-enable @typescript-eslint/no-unsafe-return */

// Use different ports to avoid conflicts if tests run in parallel
const PACT_PORT_FEED = 1235;
const PACT_PORT_CREATE = 1236;

// Define a simple mock provider
const createProvider = (port: number): Pact => {
  return new Pact({
    consumer: 'SaturnIOSApp',
    provider: 'SaturnAPI',
    port,
    log: path.resolve(process.cwd(), 'logs', 'pact.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: 'warn',
    pactfileWriteMode: 'update',
  });
};

// Create providers outside test suites to ensure proper cleanup
const feedProvider = createProvider(PACT_PORT_FEED);
const createPostProvider = createProvider(PACT_PORT_CREATE);

// Global teardown to ensure all providers are finalized
afterAll(async () => {
  await Promise.all([feedProvider.finalize(), createPostProvider.finalize()]);
});

describe('API Pact Tests - Post Service', () => {
  // --- Feed Tests Suite ---
  describe('Fetching Feed Posts', () => {
    beforeAll(() => feedProvider.setup());
    afterEach(() => feedProvider.verify());

    test('should return a list of posts on success', async () => {
      // Setup the expected interaction
      await feedProvider.addInteraction({
        state: 'User is authenticated and posts exist',
        uponReceiving: 'a request to get the feed posts',
        withRequest: {
          method: 'GET',
          path: ApiEndpoints.posts,
          headers: {
            Authorization: 'Bearer VALID_TOKEN_EXAMPLE',
            Accept: 'application/json, text/plain, */*',
          },
        },
        willRespondWith: {
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            posts: [
              {
                _id: 'postId123',
                id: 'postId123',
                author: {
                  _id: 'userId123',
                  id: 'userId123',
                  username: 'testuser',
                  displayName: 'Test User Display Name',
                  avatarUrl: 'http://example.com/avatar.jpg',
                },
                content: 'This is some post content',
                createdAt: '2025-01-01T12:00:00Z',
                likeCount: 10,
                commentCount: 5,
                isLiked: false,
              },
            ],
            hasMore: false,
          },
        },
      });

      // Mock the token storage
      jest
        .spyOn(tokenStorage, 'getToken')
        .mockResolvedValue('VALID_TOKEN_EXAMPLE');

      // Set the base URL for this test
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_FEED}`;

      try {
        const posts = await fetchFeedPosts();

        // Verify the response
        expect(posts).toBeDefined();
        expect(Array.isArray(posts)).toBe(true);
        expect(posts.length).toBeGreaterThan(0);

        const firstPost = posts[0];
        expect(firstPost.id).toBeDefined();
        expect(firstPost.content).toBeDefined();
        expect(firstPost.author).toBeDefined();
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
      }
    });
  });

  // --- Create Post Tests Suite ---
  describe('Creating a Post', () => {
    beforeAll(() => createPostProvider.setup());
    afterEach(() => createPostProvider.verify());

    test('should return the created post on success', async () => {
      // Setup the expected interaction
      await createPostProvider.addInteraction({
        state: 'User is authenticated',
        uponReceiving: 'a request to create a new post',
        withRequest: {
          method: 'POST',
          path: ApiEndpoints.posts,
          headers: {
            Authorization: 'Bearer VALID_TOKEN_EXAMPLE',
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
          },
          body: {
            content: 'This is a new test post!',
          },
        },
        willRespondWith: {
          status: 201,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: {
            _id: 'newPostId123',
            id: 'newPostId123',
            author: {
              _id: 'userId123',
              id: 'userId123',
              username: 'testuser',
              displayName: 'Test User Display Name',
              avatarUrl: 'http://example.com/avatar.jpg',
            },
            content: 'This is a new test post!',
            createdAt: '2025-01-01T12:00:00Z',
            likeCount: 0,
            commentCount: 0,
            isLiked: false,
          },
        },
      });

      // Mock the token storage
      jest
        .spyOn(tokenStorage, 'getToken')
        .mockResolvedValue('VALID_TOKEN_EXAMPLE');

      // Set the base URL for this test
      mockApiClient.defaults.baseURL = `http://localhost:${PACT_PORT_CREATE}`;

      try {
        const newPostData = { content: 'This is a new test post!' };
        const createdPost = await createPost(newPostData);

        // Verify the response
        expect(createdPost).toBeDefined();
        expect(createdPost.id).toBeDefined();
        expect(createdPost.content).toEqual(newPostData.content);
        expect(createdPost.author).toBeDefined();
      } finally {
        // Reset mocks
        jest.restoreAllMocks();
      }
    });
  });
});
