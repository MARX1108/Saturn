// Test setup for PostService unlike method
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { PostService } from '@/modules/posts/services/postService';
import { Db, ObjectId, WithId } from 'mongodb';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { Actor } from '@/modules/actors/models/actor'; // <<< Correct Actor import path
import { Post } from '@/modules/posts/models/post'; // Import Post model
// Mocks (using jest-mock-extended or similar)
import { mock, MockProxy } from 'jest-mock-extended';
import { MongoClient, MongoMemoryServer } from 'mongodb';
import { MockActorService } from '@test/mocks/mockActorService';

// Mock dependencies
let mockPostRepository: MockProxy<PostRepository>;
let mockActorService: MockProxy<ActorService>;
let mockNotificationService: MockProxy<NotificationService>;
let postService: PostService;
let mockDb: MockProxy<Db>; // If needed

// Sample data
const postId = new ObjectId().toHexString();
const actorId = new ObjectId().toHexString();
const nonExistentPostId = new ObjectId().toHexString();

describe('PostService - Unlike Post', () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;
  let postRepository: PostRepository;
  let mockActorServiceInstance: MockActorService;

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
    // Instantiate mock actor service
    mockActorServiceInstance = new MockActorService(testDomain);

    // Corrected PostService instantiation (repo, actorService, domain)
    postService = new PostService(
      postRepository,
      mockActorServiceInstance as ActorService, // Cast MockActorService to ActorService
      testDomain
    );
    // Inject NotificationService via setter
    postService.setNotificationService(mockNotificationService as any);
  });

  afterEach(async () => {
    // Clear relevant collections to isolate tests
    await db.collection('posts').deleteMany({});
    await db.collection('actors').deleteMany({});
    // No 'likes' collection assumed, likes are on post doc
    // Reset mocks
    jest.clearAllMocks();
    // Clear mock actor service store if necessary
    (mockActorServiceInstance as any).actors.clear(); // Accessing private member for test reset
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

  // Helper function to create test actor using the mock service
  async function createActor(
    data: Partial<Actor> = {}
  ): Promise<WithId<Actor>> {
    const actorData = {
      preferredUsername:
        data.preferredUsername || `testuser-${new ObjectId().toHexString()}`,
      publicKey: 'mock-key', // Add required fields
      privateKey: 'mock-key',
      ...data,
    };
    return mockActorServiceInstance.createLocalActor(actorData);
  }

  // Helper function to create test post directly in DB
  async function createPost(
    data: Partial<OptionalUnlessRequiredId<Post>>
  ): Promise<WithId<Post>> {
    const now = new Date();
    const postData: OptionalUnlessRequiredId<Post> = {
      content: data.content || 'Test post content',
      actorId: data.actorId || new ObjectId(), // Ensure actorId is provided
      visibility: data.visibility || 'public',
      sensitive: data.sensitive || false,
      attachments: data.attachments || [],
      mentions: data.mentions || [],
      tags: data.tags || [],
      likes: data.likes || [],
      shares: data.shares || [],
      replies: data.replies || [],
      // createdAt, updatedAt, published, url should be set by repo/DB
      ...data,
    };
    // Use repository create which handles defaults
    const result = await postRepository.create(postData);
    return result;
  }

  // Helper function to add a like directly to DB (simulating likePost)
  async function addLike(actorId: ObjectId, postId: ObjectId): Promise<void> {
    await postRepository.collection.updateOne(
      { _id: postId },
      {
        $addToSet: { likes: actorId }, // Add actorId to likes array
        // $inc: { likesCount: 1 } // If a separate counter exists
      }
    );
  }

  describe('unlikePost', () => {
    it('should unlike a previously liked post', async () => {
      // ARRANGE
      const actor = await createActor({
        preferredUsername: 'unlike-test-user',
      });
      const post = await createPost({
        actorId: actor._id,
        content: 'This post will be unliked',
      });

      // Add a like to the post
      await addLike(actor._id, post._id);

      // Verify the post has been liked
      const likedPost = await postRepository.findById(post._id);
      expect(likedPost?.likes).toContainEqual(actor._id);

      // ACT
      const result = await postService.unlikePost(
        post._id.toString(),
        actor._id.toString()
      );

      // ASSERT
      expect(result).toBe(true);

      // Verify the database state
      const unlikedPost = await postRepository.findById(post._id);
      expect(unlikedPost?.likes).not.toContainEqual(actor._id);
    });

    it("should return false when trying to unlike a post that wasn't liked", async () => {
      // ARRANGE
      const actor = await createActor();
      const post = await createPost({ actorId: actor._id });

      // ACT
      const result = await postService.unlikePost(
        post._id.toString(),
        actor._id.toString()
      );

      // ASSERT
      expect(result).toBe(false);
      const postAfter = await postRepository.findById(post._id);
      expect(postAfter?.likes).toEqual([]);
    });

    it('should return false for non-existent post', async () => {
      // ARRANGE
      const actor = await createActor();
      const nonExistentPostId = new ObjectId().toString();

      // ACT
      const result = await postService.unlikePost(
        nonExistentPostId,
        actor._id.toString()
      );

      // ASSERT
      expect(result).toBe(false);
    });

    it("should not allow unliking if actor didn't like the post", async () => {
      // ARRANGE
      const postOwner = await createActor({ preferredUsername: 'owner' });
      const liker = await createActor({ preferredUsername: 'liker' });
      const otherUser = await createActor({ preferredUsername: 'other' });

      const post = await createPost({ actorId: postOwner._id });
      await addLike(liker._id, post._id); // 'liker' likes the post

      // Verify the like exists
      const postBefore = await postRepository.findById(post._id);
      expect(postBefore?.likes).toContainEqual(liker._id);

      // ACT - 'otherUser' tries to unlike
      const result = await postService.unlikePost(
        post._id.toString(),
        otherUser._id.toString()
      );

      // ASSERT
      expect(result).toBe(false); // Should fail

      // Verify the like still exists
      const postAfter = await postRepository.findById(post._id);
      expect(postAfter?.likes).toContainEqual(liker._id);
    });
  });
});
