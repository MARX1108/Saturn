import { ObjectId } from 'mongodb';
import { PostService } from '../postService';
import { Post } from '../../types/post';
import { PostRepository } from '../../repositories/postRepository';

// Mock the postRepository
jest.mock('../../repositories/postRepository');
// Mock the plugins system
jest.mock('../../plugins', () => ({
  executeHook: jest.fn()
}));

// Create a mock instance of PostRepository
const MockPostRepository = PostRepository as jest.MockedClass<typeof PostRepository>;

describe('PostService', () => {
  let postService: PostService;
  let mockRepository: jest.Mocked<PostRepository>;
  const mockDomain = 'example.com';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock DB (it won't be used because we're mocking the repository)
    const mockDb: any = {};
    
    // Create an instance of the service with our mocked repository
    postService = new PostService(mockDb, mockDomain);
    
    // Get the mocked repository instance from the constructor
    mockRepository = MockPostRepository.mock.instances[0] as jest.Mocked<PostRepository>;
  });

  it('should create a post', async () => {
    // Arrange
    const actorId = new ObjectId().toString();
    const postData = {
      content: 'Test post content',
      username: 'testuser',
      sensitive: false,
      contentWarning: '',
      attachments: []
    };

    const expectedPost: Post = {
      _id: new ObjectId(),
      content: postData.content,
      actorId: new ObjectId(actorId),
      createdAt: expect.any(Date),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: expect.stringContaining(`https://${mockDomain}/posts/`),
      attributedTo: `https://${mockDomain}/users/${postData.username}`,
    };

    // Mock the create method of our repository to return the expected post
    mockRepository.create.mockResolvedValue(expectedPost);

    // Act
    const result = await postService.createPost(postData, actorId);

    // Assert
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: postData.content,
        actorId: expect.any(ObjectId),
        createdAt: expect.any(Date),
      })
    );
    expect(result).toEqual(expectedPost);
  });

  it('should get a post by ID', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const expectedPost: Post = {
      _id: new ObjectId(postId),
      content: 'Test post',
      actorId: new ObjectId(),
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://${mockDomain}/posts/${postId}`,
      attributedTo: `https://${mockDomain}/users/testuser`,
    };

    // Mock the findById method
    mockRepository.findById.mockResolvedValue(expectedPost);

    // Act
    const result = await postService.getPostById(postId);

    // Assert
    expect(mockRepository.findById).toHaveBeenCalledWith(postId);
    expect(result).toEqual(expectedPost);
  });

  it('should update a post if user is the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    const updates = {
      content: 'Updated content',
      sensitive: true,
      contentWarning: 'Warning',
    };

    const existingPost: Post = {
      _id: new ObjectId(postId),
      content: 'Original content',
      actorId: new ObjectId(actorId),
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://${mockDomain}/posts/${postId}`,
      attributedTo: `https://${mockDomain}/users/testuser`,
    };

    const updatedPost: Post = {
      ...existingPost,
      content: updates.content,
      sensitive: updates.sensitive,
      contentWarning: updates.contentWarning,
    };

    // Mock repository methods
    mockRepository.isOwner.mockResolvedValue(true);
    mockRepository.update.mockResolvedValue(true);
    mockRepository.findById.mockResolvedValue(updatedPost);

    // Act
    const result = await postService.updatePost(postId, actorId, updates);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.update).toHaveBeenCalledWith(
      postId,
      expect.objectContaining({
        content: updates.content,
        sensitive: updates.sensitive,
        contentWarning: updates.contentWarning,
      })
    );
    expect(result).toEqual(updatedPost);
  });

  it('should not update a post if user is not the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock isOwner to return false (user is not the owner)
    mockRepository.isOwner.mockResolvedValue(false);

    // Act
    const result = await postService.updatePost(
      postId, 
      actorId, 
      { content: 'Unauthorized update' }
    );

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.update).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should delete a post if user is the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock repository methods
    mockRepository.isOwner.mockResolvedValue(true);
    mockRepository.delete.mockResolvedValue(true);

    // Act
    const result = await postService.deletePost(postId, actorId);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.delete).toHaveBeenCalledWith(postId);
    expect(result).toBe(true);
  });

  it('should not delete a post if user is not the owner', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock isOwner to return false (user is not the owner)
    mockRepository.isOwner.mockResolvedValue(false);

    // Act
    const result = await postService.deletePost(postId, actorId);

    // Assert
    expect(mockRepository.isOwner).toHaveBeenCalledWith(postId, actorId);
    expect(mockRepository.delete).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should like a post', async () => {
    // Arrange
    const postId = new ObjectId().toString();
    const actorId = new ObjectId().toString();
    
    // Mock repository methods
    mockRepository.likePost.mockResolvedValue(true);

    // Act
    const result = await postService.likePost(postId, actorId);

    // Assert
    expect(mockRepository.likePost).toHaveBeenCalledWith(postId);
    expect(result).toBe(true);
  });
});

import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ActorRepository } from "../../repositories/actorRepository";
import path from "path";
import fs from "fs";

describe("PostService", () => {
  let mongoServer: MongoMemoryServer;
  let connection: MongoClient;
  let db: Db;
  let postService: PostService;
  let testUserId: string;
  const testDomain = "test.local";

  beforeAll(async () => {
    // Set up MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    connection = await MongoClient.connect(mongoServer.getUri());
    db = connection.db("test");
    postService = new PostService(db, testDomain);

    // Create test directories if needed
    const uploadsDir = path.join(process.cwd(), "uploads");
    const publicMediaDir = path.join(process.cwd(), "public", "media");
    
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(publicMediaDir, { recursive: true });
  });

  afterAll(async () => {
    if (connection) await connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection("posts").deleteMany({});
    await db.collection("actors").deleteMany({});
    await db.collection("likes").deleteMany({});

    // Create a test user
    const actorRepo = new ActorRepository(db);
    const actor = {
      preferredUsername: "testuser",
      name: "Test User",
      summary: "Test bio",
      type: "Person",
      inbox: `https://${testDomain}/users/testuser/inbox`,
      outbox: `https://${testDomain}/users/testuser/outbox`,
      following: [],
    };
    
    const result = await actorRepo.create(actor);
    testUserId = result._id.toString();
  });

  describe("createPost", () => {
    it("should create a basic post", async () => {
      // Act
      const post = await postService.createPost({
        content: "This is a test post",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Assert
      expect(post).toBeDefined();
      expect(post._id).toBeDefined();
      expect(post.content).toBe("This is a test post");
      expect(post.actorId.toString()).toBe(testUserId);
      
      // Check default values
      expect(post.likes).toBe(0);
      expect(post.replies).toBe(0);
      expect(post.reposts).toBe(0);
      expect(post.sensitive).toBe(false);
      expect(post.attachments).toEqual([]);
      
      // Check ActivityPub fields
      expect(post.type).toBe("Note");
      expect(post.id).toContain(`https://${testDomain}/posts/`);
      expect(post.attributedTo).toBe(`https://${testDomain}/users/testuser`);
    });

    it("should create a post with sensitive content", async () => {
      // Act
      const post = await postService.createPost({
        content: "This is sensitive content",
        sensitive: true,
        contentWarning: "Sensitive topic",
        attachments: [],
      }, testUserId);

      // Assert
      expect(post.sensitive).toBe(true);
      expect(post.contentWarning).toBe("Sensitive topic");
    });

    it("should create a post with attachments", async () => {
      // Act
      const post = await postService.createPost({
        content: "Post with attachments",
        sensitive: false,
        contentWarning: "",
        attachments: [
          {
            url: "/media/test-image.jpg",
            mediaType: "image/jpeg",
            width: 800,
            height: 600,
          }
        ],
      }, testUserId);

      // Assert
      expect(post.attachments).toHaveLength(1);
      expect(post.attachments[0].url).toBe("/media/test-image.jpg");
      expect(post.attachments[0].mediaType).toBe("image/jpeg");
    });

    it("should extract hashtags from content", async () => {
      // Act
      const post = await postService.createPost({
        content: "This post has #hashtags and #multiple tags",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Assert
      expect(post.tags).toBeDefined();
      expect(post.tags).toContain("hashtags");
      expect(post.tags).toContain("multiple");
      expect(post.tags).toHaveLength(2);
    });
  });

  describe("getPostById", () => {
    it("should retrieve a post by ID", async () => {
      // Arrange
      const createdPost = await postService.createPost({
        content: "Post to retrieve",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const retrievedPost = await postService.getPostById(createdPost._id.toString());

      // Assert
      expect(retrievedPost).toBeDefined();
      expect(retrievedPost?._id.toString()).toBe(createdPost._id.toString());
      expect(retrievedPost?.content).toBe("Post to retrieve");
    });

    it("should include author information when retrieving a post", async () => {
      // Arrange
      const createdPost = await postService.createPost({
        content: "Post with author",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const retrievedPost = await postService.getPostById(createdPost._id.toString(), { includeAuthor: true });

      // Assert
      expect(retrievedPost).toBeDefined();
      expect(retrievedPost?.author).toBeDefined();
      expect(retrievedPost?.author?.username).toBe("testuser");
      expect(retrievedPost?.author?.displayName).toBe("Test User");
    });

    it("should return null for non-existent post ID", async () => {
      // Act
      const result = await postService.getPostById(new ObjectId().toString());

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getFeed", () => {
    it("should get all posts for the feed", async () => {
      // Arrange - Create some posts
      await Promise.all([
        postService.createPost({
          content: "First post",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        }, testUserId),
        postService.createPost({
          content: "Second post",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        }, testUserId),
      ]);

      // Act
      const feed = await postService.getFeed();

      // Assert
      expect(feed.posts).toHaveLength(2);
      expect(feed.hasMore).toBe(false);
      
      // Check most recent is first
      expect(feed.posts[0].content).toBe("Second post");
      expect(feed.posts[1].content).toBe("First post");
    });

    it("should include author information in feed", async () => {
      // Arrange
      await postService.createPost({
        content: "Post with author info",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const feed = await postService.getFeed();

      // Assert
      expect(feed.posts[0].author).toBeDefined();
      expect(feed.posts[0].author?.username).toBe("testuser");
    });

    it("should handle pagination in feed", async () => {
      // Arrange - Create 25 posts
      for (let i = 0; i < 25; i++) {
        await postService.createPost({
          content: `Post ${i}`,
          sensitive: false,
          contentWarning: "",
          attachments: [],
        }, testUserId);
        
        // Add slight delay to ensure proper ordering
        await new Promise(resolve => setTimeout(resolve, 5));
      }

      // Act - Get pages
      const page1 = await postService.getFeed(1, 10);
      const page2 = await postService.getFeed(2, 10);
      const page3 = await postService.getFeed(3, 10);

      // Assert
      expect(page1.posts).toHaveLength(10);
      expect(page2.posts).toHaveLength(10);
      expect(page3.posts).toHaveLength(5);
      
      expect(page1.hasMore).toBe(true);
      expect(page2.hasMore).toBe(true);
      expect(page3.hasMore).toBe(false);
      
      // Check ordering - most recent posts first
      expect(page1.posts[0].content).toBe("Post 24");
      expect(page1.posts[9].content).toBe("Post 15");
      expect(page2.posts[0].content).toBe("Post 14");
    });
  });

  describe("getPostsByUsername", () => {
    it("should get posts by username", async () => {
      // Arrange - Create posts for test user
      await Promise.all([
        postService.createPost({
          content: "User's first post",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        }, testUserId),
        postService.createPost({
          content: "User's second post",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        }, testUserId),
      ]);

      // Act
      const result = await postService.getPostsByUsername("testuser");

      // Assert
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0].content).toBe("User's second post");
      expect(result.posts[1].content).toBe("User's first post");
    });

    it("should return empty array for non-existent username", async () => {
      // Act
      const result = await postService.getPostsByUsername("nonexistentuser");

      // Assert
      expect(result.posts).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe("updatePost", () => {
    it("should update a post if user is owner", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Original content",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const updatedPost = await postService.updatePost(
        post._id.toString(),
        testUserId,
        {
          content: "Updated content",
          sensitive: true,
          contentWarning: "Updated warning",
        }
      );

      // Assert
      expect(updatedPost).toBeDefined();
      expect(updatedPost?.content).toBe("Updated content");
      expect(updatedPost?.sensitive).toBe(true);
      expect(updatedPost?.contentWarning).toBe("Updated warning");
    });

    it("should extract new hashtags after update", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Original content with #oldtag",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const updatedPost = await postService.updatePost(
        post._id.toString(),
        testUserId,
        {
          content: "Updated content with #newtag",
          sensitive: false,
          contentWarning: "",
        }
      );

      // Assert
      expect(updatedPost?.tags).toContain("newtag");
      expect(updatedPost?.tags).not.toContain("oldtag");
    });

    it("should return null if post doesn't exist", async () => {
      // Act
      const result = await postService.updatePost(
        new ObjectId().toString(),
        testUserId,
        { content: "Updated content" }
      );

      // Assert
      expect(result).toBeNull();
    });

    it("should return null if user is not the owner", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Original content",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act - Try to update with different user ID
      const result = await postService.updatePost(
        post._id.toString(),
        new ObjectId().toString(),
        { content: "Updated by wrong user" }
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("deletePost", () => {
    it("should delete a post if user is owner", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post to delete",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const result = await postService.deletePost(post._id.toString(), testUserId);

      // Assert
      expect(result).toBe(true);

      // Verify post is deleted
      const deletedPost = await postService.getPostById(post._id.toString());
      expect(deletedPost).toBeNull();
    });

    it("should return false if post doesn't exist", async () => {
      // Act
      const result = await postService.deletePost(
        new ObjectId().toString(),
        testUserId
      );

      // Assert
      expect(result).toBe(false);
    });

    it("should return false if user is not the owner", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post that shouldn't be deleted",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act - Try to delete with different user ID
      const result = await postService.deletePost(
        post._id.toString(),
        new ObjectId().toString()
      );

      // Assert
      expect(result).toBe(false);

      // Verify post still exists
      const existingPost = await postService.getPostById(post._id.toString());
      expect(existingPost).not.toBeNull();
    });
  });

  describe("likePost", () => {
    it("should like a post", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post to like",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Create another user to like the post
      const otherUser = {
        _id: new ObjectId(),
        preferredUsername: "liker",
        name: "Post Liker",
      };
      await db.collection("actors").insertOne(otherUser);

      // Act
      const result = await postService.likePost(
        post._id.toString(),
        otherUser._id.toString()
      );

      // Assert
      expect(result).toBe(true);

      // Verify like was recorded
      const likedPost = await postService.getPostById(
        post._id.toString(),
        { currentUserId: otherUser._id.toString() }
      );
      expect(likedPost?.likes).toBe(1);
      expect(likedPost?.liked).toBe(true);
    });

    it("should not allow liking a post twice", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post to like twice",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      const likerId = new ObjectId().toString();

      // Like once
      await postService.likePost(post._id.toString(), likerId);

      // Act - Like again
      const result = await postService.likePost(post._id.toString(), likerId);

      // Assert
      expect(result).toBe(false);

      // Verify like count is still 1
      const likedPost = await postService.getPostById(post._id.toString());
      expect(likedPost?.likes).toBe(1);
    });
  });

  describe("unlikePost", () => {
    it("should unlike a previously liked post", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post to unlike",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      const likerId = new ObjectId().toString();

      // Like the post first
      await postService.likePost(post._id.toString(), likerId);

      // Act - Unlike
      const result = await postService.unlikePost(post._id.toString(), likerId);

      // Assert
      expect(result).toBe(true);

      // Verify like was removed
      const unlikedPost = await postService.getPostById(
        post._id.toString(),
        { currentUserId: likerId }
      );
      expect(unlikedPost?.likes).toBe(0);
      expect(unlikedPost?.liked).toBe(false);
    });

    it("should return false if post wasn't previously liked", async () => {
      // Arrange
      const post = await postService.createPost({
        content: "Post not liked",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act - Try to unlike without liking first
      const result = await postService.unlikePost(
        post._id.toString(),
        new ObjectId().toString()
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("createReply", () => {
    it("should create a reply to a post", async () => {
      // Arrange
      const parentPost = await postService.createPost({
        content: "Parent post",
        sensitive: false,
        contentWarning: "",
        attachments: [],
      }, testUserId);

      // Act
      const reply = await postService.createReply(
        parentPost._id.toString(),
        {
          content: "This is a reply",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        },
        testUserId
      );

      // Assert
      expect(reply).toBeDefined();
      expect(reply.content).toBe("This is a reply");
      expect(reply.inReplyTo?.toString()).toBe(parentPost._id.toString());

      // Verify reply count was incremented
      const updatedParent = await postService.getPostById(parentPost._id.toString());
      expect(updatedParent?.replies).toBe(1);
    });

    it("should return null if parent post doesn't exist", async () => {
      // Act
      const result = await postService.createReply(
        new ObjectId().toString(),
        {
          content: "Reply to nonexistent post",
          sensitive: false,
          contentWarning: "",
          attachments: [],
        },
        testUserId
      );

      // Assert
      expect(result).toBeNull();
    });
  });
});