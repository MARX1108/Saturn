import { MongoClient, Db, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostService } from '../postService';
import {
  createTestActor,
  createTestPost,
  createTestLike,
} from '@test/helpers/factories';
import {
  connectDB,
  disconnectDB,
  clearCollections,
} from '@test/helpers/dbHelper';
import { Like } from '@/modules/likes/models/like';
import { setup, teardown } from '@test/helpers/dbHelper';

describe('PostService - Unlike Post', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let postService: PostService;

  // Test domain used for ActivityPub URLs
  const testDomain = 'test.domain';

  beforeAll(async () => {
    // Set up MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect to the in-memory database
    const connection = await connectDB(mongoUri);
    client = connection.client;
    db = connection.db;

    // Create the service to test
    postService = new PostService(db, testDomain);
  });

  afterEach(async () => {
    // Clear relevant collections to isolate tests
    await clearCollections(db, ['posts', 'actors']);
  });

  afterAll(async () => {
    // Clean up database connections
    await disconnectDB(client);
    await mongoServer.stop();
  });

  describe('unlikePost', () => {
    it('should unlike a previously liked post', async () => {
      // ARRANGE - Create independent test data using factories
      // Create test actor - this returns the full document including _id
      const actor = await createTestActor(db, {
        preferredUsername: 'unlike-test-user',
      });

      // Create test post owned by this actor
      const post = await createTestPost(db, {
        authorId: actor._id,
        content: 'This post will be unliked',
      });

      // Add a like to the post
      await createTestLike(db, actor._id, post._id);

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
      const actor = await createTestActor(db);
      const post = await createTestPost(db, { authorId: actor._id });

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
      const actor = await createTestActor(db);
      const nonExistentPostId = new ObjectId().toString();

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
      const postOwner = await createTestActor(db, {
        preferredUsername: 'post-owner',
      });
      const liker = await createTestActor(db, { preferredUsername: 'liker' });
      const otherUser = await createTestActor(db, {
        preferredUsername: 'other-user',
      });

      // Create a post and add a like from the liker
      const post = await createTestPost(db, { authorId: postOwner._id });
      await createTestLike(db, liker._id, post._id);

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
