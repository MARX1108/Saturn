'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const mongodb_1 = require('mongodb');
const mongodb_memory_server_1 = require('mongodb-memory-server');
const postService_1 = require('../postService');
const factories_1 = require('@test/helpers/factories');
const dbHelper_1 = require('@test/helpers/dbHelper');
describe('PostService - Unlike Post', () => {
  let mongoServer;
  let client;
  let db;
  let postService;
  // Test domain used for ActivityPub URLs
  const testDomain = 'test.domain';
  beforeAll(async () => {
    // Set up MongoDB memory server
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    // Connect to the in-memory database
    const connection = await (0, dbHelper_1.connectDB)(mongoUri);
    client = connection.client;
    db = connection.db;
    // Create the service to test
    postService = new postService_1.PostService(db, testDomain);
  });
  afterEach(async () => {
    // Clear relevant collections to isolate tests
    await (0, dbHelper_1.clearCollections)(db, ['posts', 'actors']);
  });
  afterAll(async () => {
    // Clean up database connections
    await (0, dbHelper_1.disconnectDB)(client);
    await mongoServer.stop();
  });
  describe('unlikePost', () => {
    it('should unlike a previously liked post', async () => {
      // ARRANGE - Create independent test data using factories
      // Create test actor - this returns the full document including _id
      const actor = await (0, factories_1.createTestActor)(db, {
        preferredUsername: 'unlike-test-user',
      });
      // Create test post owned by this actor
      const post = await (0, factories_1.createTestPost)(db, {
        authorId: actor._id,
        content: 'This post will be unliked',
      });
      // Add a like to the post
      await (0, factories_1.createTestLike)(db, actor._id, post._id);
      // Verify the post has been liked
      const likedPost = await db.collection('posts').findOne({ _id: post._id });
      expect(likedPost.likedBy).toContain(actor._id);
      expect(likedPost.likes).toBe(1);
      // ACT - Perform the unlike action
      const result = await postService.unlikePost(
        post._id.toString(),
        actor._id.toString()
      );
      // ASSERT - Verify the post was unliked
      expect(result).toBe(true);
      // Verify the database state
      const unlikedPost = await db
        .collection('posts')
        .findOne({ _id: post._id });
      expect(unlikedPost.likedBy).not.toContain(actor._id);
      expect(unlikedPost.likes).toBe(0);
    });
    it("should return false when trying to unlike a post that wasn't liked", async () => {
      // ARRANGE - Create independent test data
      const actor = await (0, factories_1.createTestActor)(db);
      const post = await (0, factories_1.createTestPost)(db, {
        authorId: actor._id,
      });
      // ACT - Try to unlike a post that wasn't liked
      const result = await postService.unlikePost(
        post._id.toString(),
        actor._id.toString()
      );
      // ASSERT
      expect(result).toBe(false);
    });
    it('should return false for non-existent post', async () => {
      // ARRANGE
      const actor = await (0, factories_1.createTestActor)(db);
      const nonExistentPostId = new mongodb_1.ObjectId().toString();
      // ACT
      const result = await postService.unlikePost(
        nonExistentPostId,
        actor._id.toString()
      );
      // ASSERT
      expect(result).toBe(false);
    });
    it("should not allow a different user to unlike another user's like", async () => {
      // ARRANGE - Create two actors and a post
      const postOwner = await (0, factories_1.createTestActor)(db, {
        preferredUsername: 'post-owner',
      });
      const liker = await (0, factories_1.createTestActor)(db, {
        preferredUsername: 'liker',
      });
      const otherUser = await (0, factories_1.createTestActor)(db, {
        preferredUsername: 'other-user',
      });
      // Create a post and add a like from the liker
      const post = await (0, factories_1.createTestPost)(db, {
        authorId: postOwner._id,
      });
      await (0, factories_1.createTestLike)(db, liker._id, post._id);
      // ACT - Try to unlike with a different user
      const result = await postService.unlikePost(
        post._id.toString(),
        otherUser._id.toString()
      );
      // ASSERT - Should fail (cannot unlike someone else's like)
      expect(result).toBe(false);
      // Verify the like still exists
      const postAfterAttempt = await db
        .collection('posts')
        .findOne({ _id: post._id });
      expect(postAfterAttempt.likedBy).toEqual(
        expect.arrayContaining([liker._id])
      );
      expect(postAfterAttempt.likes).toBe(1);
    });
  });
});
