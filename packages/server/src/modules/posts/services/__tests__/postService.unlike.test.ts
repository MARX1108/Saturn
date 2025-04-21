import { MongoClient, Db, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostService } from '../postService';
import { PostRepository } from '@/modules/posts/repositories/postRepository';

// --- Mock ActorService ---
// Basic mock for ActorService methods needed by PostService
const mockActorService = {
  getActorById: jest.fn(async (id: string) => ({
    _id: new ObjectId(id),
    preferredUsername: `mockuser-${id}`,
    id: `https://test.domain/users/mockuser-${id}`,
    // Add other necessary Actor fields if needed by PostService
  })),
  getActorByUsername: jest.fn(async (username: string) => ({
    _id: new ObjectId(),
    preferredUsername: username,
    id: `https://test.domain/users/${username}`,
    // Add other necessary Actor fields
  })),
  // Add other mocked methods if PostService calls them
};

// --- Mock NotificationService ---
const mockNotificationService = {
  createNotification: jest.fn(),
  // Add other mocked methods if PostService calls them
};

describe('PostService - Unlike Post', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let postService: PostService;
  let postRepository: PostRepository; // Declare repository variable

  // Test domain used for ActivityPub URLs
  const testDomain = 'test.domain';

  beforeAll(async () => {
    // Setup DB directly in this test file
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();

    // Instantiate the repository
    postRepository = new PostRepository(db);

    // Create the service to test with the repository and mocked dependencies
    postService = new PostService(
      postRepository, // Use the instantiated repository
      mockActorService as any,
      mockNotificationService as any,
      testDomain
    );
  });

  afterEach(async () => {
    // Clear relevant collections to isolate tests
    await db.collection('posts').deleteMany({});
    await db.collection('actors').deleteMany({});
    await db.collection('likes').deleteMany({});
  });

  afterAll(async () => {
    // Teardown DB directly in this test file
    if (client) {
      await client.close();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Helper function to create test actor directly
  async function createActor(data: Partial<any> = {}): Promise<any> {
    const actorData = {
      preferredUsername: data.preferredUsername || `testuser-${new ObjectId()}`,
      name: data.name || 'Test User',
      type: 'Person',
      inbox: `https://test.domain/users/${data.preferredUsername}/inbox`,
      outbox: `https://test.domain/users/${data.preferredUsername}/outbox`,
      followers: `https://test.domain/users/${data.preferredUsername}/followers`,
      id: `https://test.domain/users/${data.preferredUsername}`,
      username: data.username || data.preferredUsername,
      displayName: data.displayName || data.name,
      bio: data.bio || '',
      summary: data.summary || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data, // Allow overriding defaults
    };
    const result = await db.collection('actors').insertOne(actorData);
    return { ...actorData, _id: result.insertedId };
  }

  // Helper function to create test post directly
  async function createPost(data: Partial<any>): Promise<any> {
    const postData = {
      content: data.content || 'Test post content',
      actorId: data.actorId || new ObjectId(), // Ensure actorId is provided or use a default
      createdAt: new Date(),
      type: 'Note',
      id: `https://test.domain/posts/${new ObjectId()}`,
      attributedTo: data.attributedTo || `https://test.domain/users/unknown`,
      likedBy: data.likedBy || [], // Use likedBy array
      likes: data.likes || 0, // Use likes count
      ...data,
    };
    const result = await db.collection('posts').insertOne(postData);
    return { ...postData, _id: result.insertedId };
  }

  // Helper function to create test like (adjust based on actual schema)
  async function createLike(
    actorId: ObjectId,
    postId: ObjectId
  ): Promise<void> {
    // Assuming likes are stored in a 'likedBy' array on the post document
    await db.collection('posts').updateOne(
      { _id: postId },
      {
        $addToSet: { likedBy: actorId },
        $inc: { likes: 1 }, // Increment likes count
      }
    );
  }

  describe('unlikePost', () => {
    it('should unlike a previously liked post', async () => {
      // ARRANGE - Create independent test data using helper functions
      const actor = await createActor({
        preferredUsername: 'unlike-test-user',
      });
      const post = await createPost({
        actorId: actor._id,
        content: 'This post will be unliked',
        attributedTo: actor.id, // Set attributedTo correctly
      });

      // Add a like to the post
      await createLike(actor._id, post._id);

      // Verify the post has been liked
      const likedPost = await db.collection('posts').findOne({ _id: post._id });
      // Check likedBy array and likes count
      expect(likedPost?.likedBy).toContainEqual(actor._id);
      expect(likedPost?.likes).toBe(1);

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
      expect(unlikedPost?.likedBy).not.toContainEqual(actor._id);
      expect(unlikedPost?.likes).toBe(0);
    });

    it("should return false when trying to unlike a post that wasn't liked", async () => {
      // ARRANGE - Create independent test data
      const actor = await createActor();
      const post = await createPost({
        actorId: actor._id,
        attributedTo: actor.id,
      });

      // ACT - Try to unlike a post that wasn't liked
      const result = await postService.unlikePost(
        post._id.toString(),
        actor._id.toString()
      );

      // ASSERT
      expect(result).toBe(false);

      // Verify the database state (optional but good)
      const postAfter = await db.collection('posts').findOne({ _id: post._id });
      expect(postAfter?.likedBy).toEqual([]);
      expect(postAfter?.likes).toBe(0);
    });

    it('should return false for non-existent post', async () => {
      // ARRANGE
      const actor = await createActor();
      const nonExistentPostId = new ObjectId().toString();

      // ACT
      // Note: The PostService method might throw if the post doesn't exist,
      // depending on its implementation. Adjust assertion if needed.
      const result = await postService.unlikePost(
        nonExistentPostId,
        actor._id.toString()
      );

      // ASSERT
      expect(result).toBe(false);
    });

    it("should not allow a different user to unlike another user's like", async () => {
      // ARRANGE - Create two actors and a post
      const postOwner = await createActor({
        preferredUsername: 'post-owner',
      });
      const liker = await createActor({ preferredUsername: 'liker' });
      const otherUser = await createActor({
        preferredUsername: 'other-user',
      });

      // Create a post and add a like from the liker
      const post = await createPost({
        actorId: postOwner._id,
        attributedTo: postOwner.id,
      });
      await createLike(liker._id, post._id);

      // Verify the like exists
      const postBefore = await db
        .collection('posts')
        .findOne({ _id: post._id });
      expect(postBefore?.likedBy).toContainEqual(liker._id);
      expect(postBefore?.likes).toBe(1);

      // ACT - Try to unlike with a different user
      const result = await postService.unlikePost(
        post._id.toString(),
        otherUser._id.toString() // otherUser tries to unlike liker's like
      );

      // ASSERT - Should fail (cannot unlike someone else's like)
      expect(result).toBe(false);

      // Verify the like still exists
      const postAfterAttempt = await db
        .collection('posts')
        .findOne({ _id: post._id });
      expect(postAfterAttempt?.likedBy).toContainEqual(liker._id);
      expect(postAfterAttempt?.likes).toBe(1);
    });
  });
});
