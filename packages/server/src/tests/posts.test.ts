import request from 'supertest';
import express from 'express';
import { MongoClient, Db, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import configurePostRoutes from '../modules/posts/routes/postRoutes';
import { ServiceContainer } from '../utils/container';
import { DbUser } from '../modules/auth/models/user';
import { mockServiceContainer } from '../../test/helpers/mockSetup';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: DbUser | undefined;
    }
  }
}

describe('Posts Routes', () => {
  let app: express.Application;
  let db: Db;
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let testUserId: string;
  let testUserToken: string;
  let testPostId: string;
  const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';

  beforeAll(async () => {
    // Set up in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db();

    // Set up Express app
    app = express();
    app.use(express.json());
    app.set('db', db);
    app.set('domain', 'test.domain');

    // Create directories for uploads
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const publicMediaDir = path.join(process.cwd(), 'public', 'media');
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(publicMediaDir, { recursive: true });

    // Configure JWT secret for testing
    process.env.JWT_SECRET = jwtSecret;

    // Setup authentication middleware
    app.use((req, res, next) => {
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, jwtSecret);
          if (typeof decoded === 'object' && decoded !== null) {
            req.user = {
              _id: (decoded as any).id,
              id: (decoded as any).id,
              username: (decoded as any).username,
              preferredUsername: (decoded as any).username,
              password: 'mockPassword',
              followers: [],
              following: [],
              email: 'decoded@example.com',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as DbUser;
          } else {
            req.user = undefined;
          }
        } catch (_error) {
          req.user = undefined;
        }
      }
      next();
    });

    // Configure routes using the full mock container
    app.use('/', configurePostRoutes(mockServiceContainer));
  });

  afterAll(async () => {
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection('posts').deleteMany({});
    await db.collection('actors').deleteMany({});
    await db.collection('likes').deleteMany({});

    // Create a test user
    const actor = await db.collection('actors').insertOne(
      {
        preferredUsername: 'testuser',
        name: 'Test User',
        summary: 'Test bio',
        type: 'Person',
        inbox: 'https://test.domain/users/testuser/inbox',
        outbox: 'https://test.domain/users/testuser/outbox',
      },
      undefined // options
      // No callback needed for async/await
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
      undefined // options
      // No callback needed for async/await
    );

    testPostId = post.insertedId.toString();
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This is a new post');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('content', 'This is a new post');
      expect(response.body).toHaveProperty('author.username', 'testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post('/posts')
        .field('content', 'This should fail');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should create a post with sensitive content', async () => {
      const response = await request(app)
        .post('/posts')
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

      const response = await request(app)
        .post('/posts')
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

      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'Post with invalid attachment')
        .attach('attachments', filePath);

      // Clean up
      fs.unlinkSync(filePath);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle server errors during post creation', async () => {
      // Force an error
      const originalInsertOne = db.collection('posts').insertOne;
      // Use mockRejectedValueOnce for simpler error simulation
      (db.collection('posts').insertOne as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      const response = await request(app)
        .post('/posts')
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This should trigger a server error');

      // Restore original function
      db.collection('posts').insertOne = originalInsertOne;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /posts', () => {
    it('should get all posts (public timeline)', async () => {
      const response = await request(app).get('/posts');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBe(1);
    });

    it('should support pagination', async () => {
      // Create 25 additional posts
      const posts = Array(25)
        .fill(0)
        .map((_, i) => ({
          content: `Test post ${i}`,
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
        }));

      await db.collection('posts').insertMany(posts);

      // Get first page (default 20 items)
      const page1 = await request(app).get('/posts');
      expect(page1.status).toBe(200);
      expect(page1.body.posts.length).toBe(20);
      expect(page1.body.hasMore).toBe(true);

      // Get second page
      const page2 = await request(app).get('/posts?page=2');
      expect(page2.status).toBe(200);
      expect(page2.body.posts.length).toBe(6); // 1 original + 25 new = 26, so page 2 has 6
      expect(page2.body.hasMore).toBe(false);
    });

    it('should filter posts by tags', async () => {
      // Create posts with tags
      await db.collection('posts').insertMany([
        {
          content: 'Post with #testing tag',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(),
          tags: ['testing'],
          likes: 0,
          replies: 0,
          reposts: 0,
        },
        {
          content: 'Post with #development tag',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(),
          tags: ['development'],
          likes: 0,
          replies: 0,
          reposts: 0,
        },
      ]);

      const response = await request(app).get('/posts?tag=testing');

      expect(response.status).toBe(200);
      expect(response.body.posts.length).toBe(2);
      expect(
        response.body.posts.some((p: any) => p.content.includes('#testing'))
      ).toBe(true);
      expect(
        response.body.posts.every(
          (p: any) => !p.content.includes('#development')
        )
      ).toBe(true);
    });

    it('should handle server errors during feed retrieval', async () => {
      // Force an error
      const originalFind = db.collection('posts').find;
      db.collection('posts').find = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/posts');

      // Restore original function
      db.collection('posts').find = originalFind;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /posts/:id', () => {
    it('should get a post by ID', async () => {
      const response = await request(app).get(`/posts/${testPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content', 'This is a test post');
      expect(response.body).toHaveProperty('author.username', 'testuser');
    });

    it('should return 404 if post not found', async () => {
      const nonExistentId = new ObjectId().toString();
      const response = await request(app).get(`/posts/${nonExistentId}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should include replies for a post', async () => {
      // Create reply to the test post
      await db.collection('posts').insertOne({
        content: 'This is a reply',
        actorId: new ObjectId(testUserId),
        createdAt: new Date(),
        inReplyTo: new ObjectId(testPostId),
        likes: 0,
        replies: 0,
        reposts: 0,
      });

      const response = await request(app).get(
        `/posts/${testPostId}?includeReplies=true`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('replies');
      expect(response.body.replies).toBeInstanceOf(Array);
      expect(response.body.replies.length).toBe(1);
      expect(response.body.replies[0].content).toBe('This is a reply');
    });

    it('should handle server errors during post retrieval', async () => {
      // Force an error
      const originalFindOne = db.collection('posts').findOne;
      db.collection('posts').findOne = jest.fn().mockImplementationOnce(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get(`/posts/${testPostId}`);

      // Restore original function
      db.collection('posts').findOne = originalFindOne;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /posts/user/:username', () => {
    it('should get posts by username', async () => {
      // Explicitly cast to Jest mock type
      (
        mockServiceContainer.postService.getPostsByUsername as jest.Mock
      ).mockResolvedValue({
        posts: [
          {
            _id: new ObjectId(testPostId),
            id: `https://test.domain/posts/${testPostId}`,
            content: 'This is a test post',
            actorId: testUserId,
            createdAt: new Date(),
            actor: { id: testUserId, username: 'testuser' },
          } as any,
        ],
        total: 1,
        limit: 20,
        offset: 0,
      });

      const response = await request(app).get('/posts/user/testuser');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array if user has no posts', async () => {
      // Create a new user without posts
      await db.collection('actors').insertOne({
        preferredUsername: 'emptyuser',
        name: 'Empty User',
        summary: 'No posts',
      });

      const response = await request(app).get('/posts/user/emptyuser');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('posts');
      expect(response.body.posts).toBeInstanceOf(Array);
      expect(response.body.posts.length).toBe(0);
    });
  });

  describe('PUT /posts/:id', () => {
    it('should update a post', async () => {
      const response = await request(app)
        .put(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'This is an updated post',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'content',
        'This is an updated post'
      );
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).put(`/posts/${testPostId}`).send({
        content: 'This should fail',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const nonExistentId = new ObjectId().toString();
      const response = await request(app)
        .put(`/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'This should fail',
        });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should not allow unauthorized updates', async () => {
      // Create another user
      const anotherUser = await db.collection('actors').insertOne({
        preferredUsername: 'anotheruser',
        name: 'Another User',
        type: 'Person',
      });

      // Create post owned by another user
      const anotherUserPost = await db.collection('posts').insertOne({
        content: 'Post by another user',
        actorId: anotherUser.insertedId,
        createdAt: new Date(),
        likes: 0,
        replies: 0,
        reposts: 0,
      });

      // Try to update with the test user's token
      const response = await request(app)
        .put(`/posts/${anotherUserPost.insertedId.toString()}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: "Trying to modify someone else's post",
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not authorized');
    });

    it('should handle server errors during post update', async () => {
      // Force an error
      const originalUpdateOne = db.collection('posts').updateOne;
      db.collection('posts').updateOne = jest
        .fn()
        .mockImplementationOnce(() => {
          throw new Error('Database error');
        });

      const response = await request(app)
        .put(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({
          content: 'This should trigger a server error',
        });

      // Restore original function
      db.collection('posts').updateOne = originalUpdateOne;

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /posts/:id', () => {
    it('should delete a post', async () => {
      const response = await request(app)
        .delete(`/posts/${testPostId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(204);

      // Verify post is deleted
      const getResponse = await request(app).get(`/posts/${testPostId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).delete(`/posts/${testPostId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if post not found', async () => {
      const nonExistentId = new ObjectId().toString();
      const response = await request(app)
        .delete(`/posts/${nonExistentId}`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/like', () => {
    it('should like a post', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify like was recorded
      const post = await request(app).get(`/posts/${testPostId}`);
      expect(post.body).toHaveProperty('likeCount', 1);
      expect(post.body).toHaveProperty('liked', true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).post(`/posts/${testPostId}/like`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should not allow liking the same post twice', async () => {
      // Like the post first time
      await request(app)
        .post(`/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      // Try to like it again
      const response = await request(app)
        .post(`/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/unlike', () => {
    it('should unlike a previously liked post', async () => {
      // First like the post
      await request(app)
        .post(`/posts/${testPostId}/like`)
        .set('Authorization', `Bearer ${testUserToken}`);

      // Then unlike it
      const response = await request(app)
        .post(`/posts/${testPostId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify like was removed
      const post = await request(app).get(`/posts/${testPostId}`);
      expect(post.body).toHaveProperty('likeCount', 0);
      expect(post.body).toHaveProperty('liked', false);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).post(`/posts/${testPostId}/unlike`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it("should return 400 if the post wasn't liked", async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/unlike`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/repost', () => {
    it('should repost a post', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/repost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify repost was recorded
      const post = await request(app).get(`/posts/${testPostId}`);
      expect(post.body).toHaveProperty('repostCount', 1);
      expect(post.body).toHaveProperty('reposted', true);
    });

    it('should not allow reposting the same post twice', async () => {
      // First repost
      await request(app)
        .post(`/posts/${testPostId}/repost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      // Try to repost again
      const response = await request(app)
        .post(`/posts/${testPostId}/repost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).post(`/posts/${testPostId}/repost`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/unrepost', () => {
    it('should unrepost a previously reposted post', async () => {
      // First repost the post
      await request(app)
        .post(`/posts/${testPostId}/repost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      // Then unrepost it
      const response = await request(app)
        .post(`/posts/${testPostId}/unrepost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify repost was removed
      const post = await request(app).get(`/posts/${testPostId}`);
      expect(post.body).toHaveProperty('repostCount', 0);
      expect(post.body).toHaveProperty('reposted', false);
    });

    it("should return 400 if the post wasn't reposted", async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/unrepost`)
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /posts/:id/reply', () => {
    it('should create a reply to a post', async () => {
      const response = await request(app)
        .post(`/posts/${testPostId}/reply`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This is a reply to the original post');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        'content',
        'This is a reply to the original post'
      );
      expect(response.body).toHaveProperty('inReplyTo', testPostId);

      // Verify the original post's reply count is incremented
      const originalPost = await request(app).get(`/posts/${testPostId}`);
      expect(originalPost.body).toHaveProperty('replyCount', 1);
    });

    it("should return 404 if the post to reply to doesn't exist", async () => {
      const nonExistentId = new ObjectId().toString();
      const response = await request(app)
        .post(`/posts/${nonExistentId}/reply`)
        .set('Authorization', `Bearer ${testUserToken}`)
        .field('content', 'This reply should fail');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /posts/trending', () => {
    it('should get trending posts based on likes and reposts', async () => {
      // Create some posts with varying popularity
      const posts = await db.collection('posts').insertMany([
        {
          content: 'Very popular post',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(),
          likes: 10,
          replies: 5,
          reposts: 7,
        },
        {
          content: 'Somewhat popular post',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(),
          likes: 5,
          replies: 2,
          reposts: 3,
        },
        {
          content: 'Unpopular post',
          actorId: new ObjectId(testUserId),
          createdAt: new Date(),
          likes: 1,
          replies: 0,
          reposts: 0,
        },
      ]);

      const response = await request(app).get('/posts/trending');

      expect(response.status).toBe(200);
      expect(response.body.posts).toBeInstanceOf(Array);

      // First post should be the most popular
      expect(response.body.posts[0].content).toBe('Very popular post');

      // Last post should be the least popular (or our original test post)
      const leastPopular = response.body.posts[response.body.posts.length - 1];
      expect(
        ['Unpopular post', 'This is a test post'].includes(leastPopular.content)
      ).toBe(true);
    });
  });
});
