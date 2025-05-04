/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/await-thenable */
// @ts-nocheck - Disabled TypeScript checking for this file due to Pact compatibility issues
import { Pact } from '@pact-foundation/pact';
import path from 'path';
import { ApiEndpoints } from '../config/api';
import { fetchFeedPosts, createPost } from './postService';
import apiClient from './apiClient';
import * as tokenStorage from './tokenStorage';

const PACT_PORT_FEED = 1235;
const PACT_PORT_CREATE = 1236;

// Define a simple mock provider
const createProvider = (port) => {
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

describe('API Pact Tests - Post Service', () => {
  // --- Feed Tests Suite ---
  describe('Fetching Feed Posts', () => {
    const provider = createProvider(PACT_PORT_FEED);

    beforeAll(() => provider.setup());
    afterAll(() => provider.finalize());

    test('should return a list of posts on success', async () => {
      // Setup the expected interaction
      await provider.addInteraction({
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

      // Make request to Pact mock server
      const originalBaseURL = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = `http://localhost:${PACT_PORT_FEED}`;

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
        // Reset
        apiClient.defaults.baseURL = originalBaseURL;
        jest.restoreAllMocks();
      }

      // Verify interactions
      await provider.verify();
    });
  });

  // --- Create Post Tests Suite ---
  describe('Creating a Post', () => {
    const provider = createProvider(PACT_PORT_CREATE);

    beforeAll(() => provider.setup());
    afterAll(() => provider.finalize());

    test('should return the created post on success', async () => {
      // Setup the expected interaction
      await provider.addInteraction({
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

      // Make request to Pact mock server
      const originalBaseURL = apiClient.defaults.baseURL;
      apiClient.defaults.baseURL = `http://localhost:${PACT_PORT_CREATE}`;

      try {
        const newPostData = { content: 'This is a new test post!' };
        const createdPost = await createPost(newPostData);

        // Verify the response
        expect(createdPost).toBeDefined();
        expect(createdPost.id).toBeDefined();
        expect(createdPost.content).toEqual(newPostData.content);
        expect(createdPost.author).toBeDefined();
      } finally {
        // Reset
        apiClient.defaults.baseURL = originalBaseURL;
        jest.restoreAllMocks();
      }

      // Verify interactions
      await provider.verify();
    });
  });
});
