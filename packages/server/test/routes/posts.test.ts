import request from 'supertest';
import { Db, ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import configurePostRoutes from '@/modules/posts/routes/postRoutes';
import { DbUser } from '../../src/modules/auth/models/user';
import { DeepMockProxy } from 'jest-mock';
import { PostService } from '@/modules/posts/services/postService';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DbUser | undefined;
    }
  }
}

declare global {
  // Add mockPostService to global scope for easier access in tests
  var mockPostService: DeepMockProxy<PostService>;
  var testApp: Express.Application;
  var request: any; // supertest request
  var mongoDb: Db;
}

describe('Posts Routes', () => {
  let testUserId: string;
  let testUserToken: string;
  let testPostId: string;
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';

  beforeEach(async () => {
    const db = global.mongoDb; // Use global db instance
    if (!db) {
      throw new Error('Global mongoDb not initialized');
    }
    // Clear collections before each test
    await db.collection('posts').deleteMany({});
    await db.collection('actors').deleteMany({});
    await db.collection('likes').deleteMany({});

    // Create a test user using global db
    const actor = await db.collection('actors').insertOne(
      {
        preferredUsername: 'testuser',
        name: 'Test User',
        summary: 'Test bio',
        type: 'Person',
        inbox: 'https://test.domain/users/testuser/inbox',
        outbox: 'https://test.domain/users/testuser/outbox',
      },
      undefined // Explicitly pass undefined for options
    );

    testUserId = actor.insertedId.toString();

    // Generate a token for the test user using defined secret
    testUserToken = jwt.sign(
      { id: testUserId, username: 'testuser' },
      jwtSecret
    );

    // Create a test post
    const post = await db.collection('posts').insertOne(
      {
        content: 'This is a test post',
        actorId: new ObjectId(testUserId),
        createdAt: new Date(),
        sensitive: false,
        contentWarning: '',
        attachments: [],
        likes: 0,
        replies: 0,
        reposts: 0,
        type: 'Note',
        id: `https://test.domain/posts/${new ObjectId()}`,
        attributedTo: `https://test.domain/users/testuser`,
      },
      undefined // Explicitly pass undefined for options
    );

    testPostId = post.insertedId.toString();
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This is a new post');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content', 'This is a new post');
      expect(response.body).toHaveProperty('author.username', 'testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .field('content', 'This should fail');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if content is missing', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should create a post with sensitive content', async () => {
      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This is sensitive content')
        .field('sensitive', 'true')
        .field('contentWarning', 'Sensitive topic');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'content',
        'This is sensitive content'
      );
      expect(response.body).toHaveProperty('sensitive', true);
      expect(response.body).toHaveProperty('contentWarning', 'Sensitive topic');
    });

    it('should create a post with attachments', async () => {
      // Create a test image
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );
      const imagePath = path.join(process.cwd(), 'test-post-image.png');
      fs.writeFileSync(imagePath, imageBuffer);

      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'Post with attachment')
        .attach('attachments', imagePath);

      // Clean up
      fs.unlinkSync(imagePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('attachments');
      expect(response.body.attachments).toBeInstanceOf(Array);
      expect(response.body.attachments.length).toBe(1);
      expect(response.body.attachments[0]).toHaveProperty('url');
      expect(response.body.attachments[0]).toHaveProperty(
        'mediaType',
        'image/png'
      );
    });

    it('should reject invalid file attachments', async () => {
      // Create an invalid file type (assuming your server rejects certain types)
      const filePath = path.join(process.cwd(), 'test-invalid.exe');
      fs.writeFileSync(filePath, 'This is an invalid file type');

      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'Post with invalid attachment')
        .attach('attachments', filePath);

      // Clean up
      fs.unlinkSync(filePath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors during post creation', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.createPost as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on insertOne')
      );

      const response = await global
        .request(global.testApp)
        .post('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This should trigger a server error');

      // Reset mock for subsequent tests if needed, though jest should handle it
      // (global.mockPostService.createPost as jest.Mock).mockRestore();

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });

    // Add more tests: post length validation, rate limiting, etc.
  });

  describe('GET /api/posts/:postId', () => {
    it('should retrieve a specific post', async () => {
      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('_id', testPostId);
      expect(response.body).toHaveProperty('content', 'This is a test post');
    });

    it('should return 404 if post is not found', async () => {
      const invalidId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${invalidId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for an invalid post ID format', async () => {
      const invalidFormatId = 'invalid-id-format';
      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${invalidFormatId}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should retrieve a post with likedByUser status if authenticated', async () => {
      // Mock the user liking the post
      await global.mongoDb.collection('likes').insertOne({
        userId: new ObjectId(testUserId),
        postId: new ObjectId(testPostId),
      });

      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('likedByUser', true);
    });

    it('should retrieve a post without likedByUser status if not liked', async () => {
      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('likedByUser', false);
    });

    it('should retrieve a post without likedByUser status if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('likedByUser', false);
    });

    it('should handle server errors during post retrieval', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.getPostById as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on findOne')
      );

      const response = await global
        .request(global.testApp)
        .get(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('GET /api/posts', () => {
    it('should retrieve a list of posts', async () => {
      // Create a few more posts
      await global.mongoDb.collection('posts').insertMany([
        {
          content: 'Post 2',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(Date.now() - 10000),
          type: 'Note',
          id: `https://test.domain/posts/${new ObjectId()}`,
          attributedTo: `https://test.domain/users/testuser`,
        },
        {
          content: 'Post 3',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(Date.now() - 20000),
          type: 'Note',
          id: `https://test.domain/posts/${new ObjectId()}`,
          attributedTo: `https://test.domain/users/testuser`,
        },
      ]);

      const response = await global.request(global.testApp).get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThanOrEqual(3);
      expect(response.body).toHaveProperty('total');
    });

    it('should retrieve posts with pagination (limit and offset)', async () => {
      // Create more posts to test pagination
      for (let i = 0; i < 15; i++) {
        await global.mongoDb.collection('posts').insertOne({
          content: `Paginated Post ${i + 1}`,
          actorId: new ObjectId(testUserId),
          createdAt: new Date(Date.now() - i * 1000),
          type: 'Note',
          id: `https://test.domain/posts/${new ObjectId()}`,
          attributedTo: `https://test.domain/users/testuser`,
        });
      }

      // Test limit
      const responseLimit = await global
        .request(global.testApp)
        .get('/api/posts?limit=5');
      expect(responseLimit.status).toBe(200);
      expect(responseLimit.body.posts.length).toBe(5);

      // Test offset
      const responseOffset = await global
        .request(global.testApp)
        .get('/api/posts?limit=5&offset=5');
      expect(responseOffset.status).toBe(200);
      expect(responseOffset.body.posts.length).toBe(5);
      // Ensure the first post in the offset response is not the same as the first in the limit response
      expect(responseOffset.body.posts[0]._id).not.toEqual(
        responseLimit.body.posts[0]._id
      );
    });

    it('should retrieve posts sorted by createdAt descending by default', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/posts?limit=5');
      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBeGreaterThan(1);

      const firstPostDate = new Date(response.body.posts[0].createdAt);
      const secondPostDate = new Date(response.body.posts[1].createdAt);
      expect(firstPostDate.getTime()).toBeGreaterThanOrEqual(
        secondPostDate.getTime()
      );
    });

    it('should retrieve posts filtered by username', async () => {
      // Create posts by another user
      const otherUser = await global.mongoDb.collection('actors').insertOne({
        preferredUsername: 'otheruser',
        name: 'Other User',
        type: 'Person',
        inbox: 'https://test.domain/users/otheruser/inbox',
        outbox: 'https://test.domain/users/otheruser/outbox',
      });
      const otherUserId = otherUser.insertedId;
      await global.mongoDb.collection('posts').insertOne({
        content: 'Post by other user',
        actorId: otherUserId,
        createdAt: new Date(),
        type: 'Note',
        id: `https://test.domain/posts/${new ObjectId()}`,
        attributedTo: `https://test.domain/users/otheruser`,
      });

      const response = await global
        .request(global.testApp)
        .get('/api/posts?username=testuser');
      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBeGreaterThanOrEqual(1);
      response.body.posts.forEach((post: any) => {
        expect(post.author.username).toBe('testuser');
      });

      const otherUserResponse = await global
        .request(global.testApp)
        .get('/api/posts?username=otheruser');
      expect(otherUserResponse.status).toBe(200);
      expect(otherUserResponse.body.posts.length).toBe(1);
      expect(otherUserResponse.body.posts[0].author.username).toBe('otheruser');
    });

    it('should retrieve posts with likedByUser status for authenticated user', async () => {
      // Like the first post retrieved
      const postsResponse = await global
        .request(global.testApp)
        .get('/api/posts?limit=1');
      const firstPostId = postsResponse.body.posts[0]._id;
      await global.mongoDb.collection('likes').insertOne({
        userId: new ObjectId(testUserId),
        postId: new ObjectId(firstPostId),
      });

      const authResponse = await global
        .request(global.testApp)
        .get('/api/posts?limit=1')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(authResponse.status).toBe(200);
      expect(authResponse.body.posts.length).toBe(1);
      expect(authResponse.body.posts[0]).toHaveProperty('likedByUser', true);
    });

    it('should handle server errors during post list retrieval', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.getFeed as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on find')
      );

      const response = await global
        .request(global.testApp)
        .get('/api/posts')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('PUT /api/posts/:postId', () => {
    it('should update an existing post', async () => {
      const newContent = 'Updated post content';
      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: newContent });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content', newContent);

      // Verify in DB
      const updatedPost = await global.mongoDb
        .collection('posts')
        .findOne({ _id: new ObjectId(testPostId) });
      expect(updatedPost).toHaveProperty('content', newContent);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${testPostId}`)
        .send({ content: 'This should fail' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if user is not the author', async () => {
      // Create another user and token
      const otherUserActor = await global.mongoDb
        .collection('actors')
        .insertOne({
          preferredUsername: 'otheruser',
          name: 'Other User',
          type: 'Person',
          inbox: 'https://test.domain/users/otheruser/inbox',
          outbox: 'https://test.domain/users/otheruser/outbox',
        });
      const otherUserId = otherUserActor.insertedId.toString();
      const otherUserToken = jwt.sign(
        { id: otherUserId, username: 'otheruser' },
        jwtSecret
      );

      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ content: 'Trying to update someone elses post' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const invalidId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${invalidId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Updating non-existent post' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if content is missing', async () => {
      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({}); // No content

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors during post update', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.updatePost as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on updateOne')
      );

      const response = await global
        .request(global.testApp)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ content: 'Updated content' });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });

    // Add tests for updating sensitive status, attachments (if allowed), etc.
  });

  describe('DELETE /api/posts/:postId', () => {
    it('should delete an existing post', async () => {
      const response = await global
        .request(global.testApp)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(204); // No content on successful delete

      // Verify in DB
      const deletedPost = await global.mongoDb
        .collection('posts')
        .findOne({ _id: new ObjectId(testPostId) });
      expect(deletedPost).toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .delete(`/api/posts/${testPostId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 if user is not the author', async () => {
      // Create another user and token
      const otherUserActor = await global.mongoDb
        .collection('actors')
        .insertOne({
          preferredUsername: 'otheruser',
          name: 'Other User',
          type: 'Person',
          inbox: 'https://test.domain/users/otheruser/inbox',
          outbox: 'https://test.domain/users/otheruser/outbox',
        });
      const otherUserId = otherUserActor.insertedId.toString();
      const otherUserToken = jwt.sign(
        { id: otherUserId, username: 'otheruser' },
        jwtSecret
      );

      const response = await global
        .request(global.testApp)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const invalidId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .delete(`/api/posts/${invalidId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors during post deletion', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.deletePost as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on deleteOne')
      );

      const response = await global
        .request(global.testApp)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('POST /api/posts/:postId/like', () => {
    it('should like a post', async () => {
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Post liked successfully'
      );

      // Verify like in DB
      const likeRecord = await global.mongoDb.collection('likes').findOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });
      expect(likeRecord).not.toBeNull();

      // Verify post like count incremented
      const post = await global.mongoDb
        .collection('posts')
        .findOne({ _id: new ObjectId(testPostId) });
      expect(post?.likes).toBe(1);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/like`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const invalidId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${invalidId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if post is already liked', async () => {
      // Like the post first
      await global.mongoDb.collection('likes').insertOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });

      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Post already liked');
    });

    it('should handle server errors during like', async () => {
      // Mock the service layer instead of the DB
      (global.mockPostService.likePost as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on insertOne (likes)')
      );

      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  describe('POST /api/posts/:postId/unlike', () => {
    beforeEach(async () => {
      // Ensure the post is liked before each unlike test
      await global.mongoDb.collection('likes').insertOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });
      // Update the post's like count to 1
      await global.mongoDb.collection('posts').updateOne(
        { _id: new ObjectId(testPostId) },
        { $set: { likes: 1 } } // Ensure likes count is correct
      );
    });

    it('should unlike a post', async () => {
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Post unliked successfully'
      );

      // Verify like removed from DB
      const likeRecord = await global.mongoDb.collection('likes').findOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });
      expect(likeRecord).toBeNull();

      // Verify post like count decremented
      const post = await global.mongoDb
        .collection('posts')
        .findOne({ _id: new ObjectId(testPostId) });
      expect(post?.likes).toBe(0);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/unlike`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const invalidId = new ObjectId().toString();
      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${invalidId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 if post is not liked', async () => {
      // Unlike the post first to ensure it's not liked
      await global.mongoDb.collection('likes').deleteOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });

      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Post not liked');
    });

    it('should handle server errors during unlike', async () => {
      // First like the post so unlike can find something
      await global.mongoDb.collection('likes').insertOne({
        postId: new ObjectId(testPostId),
        userId: new ObjectId(testUserId),
      });
      await global.mongoDb
        .collection('posts')
        .updateOne({ _id: new ObjectId(testPostId) }, { $inc: { likes: 1 } });

      // Mock the service layer instead of the DB
      (global.mockPostService.unlikePost as jest.Mock).mockRejectedValueOnce(
        new Error('Database error on deleteOne (likes)')
      );

      const response = await global
        .request(global.testApp)
        .post(`/api/posts/${testPostId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Internal Server Error');
    });
  });

  // Add tests for other routes: /posts/:postId/replies, /posts/:postId/reposts, etc.

  describe('GET /api/users/:username/posts', () => {
    it('should retrieve posts for a specific user', async () => {
      // Ensure test user exists
      const testUsername = 'testuser';
      await global.mongoDb
        .collection('actors')
        .insertOne({ preferredUsername: testUsername });
      // Add posts specifically for this user if beforeEach setup isn't sufficient

      const response = await global
        .request(global.testApp)
        .get(`/api/users/${testUsername}/posts`);

      expect(response.status).toBe(200);
      expect(response.body.posts).toBeInstanceOf(Array);
      // Add more specific assertions if needed
    });

    it('should return 404 if user does not exist', async () => {
      const response = await global
        .request(global.testApp)
        .get('/api/users/nonexistentuser/posts');
      expect(response.status).toBe(404);
    });

    it('should handle server errors during user post retrieval', async () => {
      (
        global.mockPostService.getPostsByUsername as jest.Mock
      ).mockRejectedValueOnce(new Error('DB error'));
      const response = await global
        .request(global.testApp)
        .get('/api/users/testuser/posts')
        .set('Authorization', `Bearer ${testUserToken}`);
      expect(response.status).toBe(500);
    });
  });
});
