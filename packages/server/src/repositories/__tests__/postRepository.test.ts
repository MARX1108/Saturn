import { MongoClient, Db, ObjectId } from "mongodb";
import { PostRepository } from "../postRepository";
import { setupTestDb, teardownTestDb } from "../../tests/testUtils";

jest.setTimeout(10000); // Increase timeout to 10 seconds for long-running tests

describe("PostRepository", () => {
  let client: MongoClient;
  let db: Db;
  let postRepository: PostRepository;
  let testActorId: ObjectId;

  beforeAll(async () => {
    const setup = await setupTestDb();
    client = setup.client;
    db = setup.db;
    postRepository = new PostRepository(db);
    
    // Create a test actor for posts
    testActorId = new ObjectId();
    await db.collection("actors").insertOne({
      _id: testActorId,
      preferredUsername: "testuser",
      name: "Test User",
      type: "Person",
    });
  });

  afterAll(async () => {
    await teardownTestDb(client, db);
  });

  beforeEach(async () => {
    // Clean up the collection before each test
    await db.collection("posts").deleteMany({});
  });

  describe("create", () => {
    it("should create a new post", async () => {
      // Arrange
      const postData = {
        content: "This is a test post",
        authorId: testActorId.toString(),
        visibility: "public"
      };

      // Act
      const result = await postRepository.create(postData);

      // Assert
      expect(result).toBeDefined();
      expect(result.content).toBe("This is a test post");
      expect(result.authorId.toString()).toBe(testActorId.toString());
      expect(result._id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.visibility).toBe("public");
    });

    it("should create a post with attachments", async () => {
      // Arrange
      const postData = {
        content: "Post with attachments",
        authorId: testActorId.toString(),
        visibility: "public",
        attachments: [
          {
            type: "Image",
            url: "/uploads/test.jpg",
            mediaType: "image/jpeg",
          }
        ]
      };

      // Act
      const result = await postRepository.create(postData);

      // Assert
      expect(result).toBeDefined();
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].url).toBe("/uploads/test.jpg");
      expect(result.attachments[0].mediaType).toBe("image/jpeg");
    });

    it("should create a post with tags", async () => {
      // Arrange
      const postData = {
        content: "This is a #test post with #tags",
        authorId: testActorId.toString(),
      };

      // Act
      const result = await postRepository.create(postData);

      // Assert
      expect(result).toBeDefined();
      expect(result.tags).toEqual(["test", "tags"]);
    });
  });

  describe("findById", () => {
    it("should find a post by ID", async () => {
      // Arrange
      const postData = {
        content: "Find me by ID",
        authorId: testActorId,
      };
      const insertResult = await db.collection("posts").insertOne(postData);
      const postId = insertResult.insertedId.toString();

      // Act
      const result = await postRepository.findById(postId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.content).toBe("Find me by ID");
      expect(result?._id.toString()).toBe(postId);
    });

    it("should return null when post ID not found", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();

      // Act
      const result = await postRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByAuthor", () => {
    it("should find posts by author ID", async () => {
      // Arrange
      const author1Id = new ObjectId();
      const author2Id = new ObjectId();
      
      await db.collection("posts").insertMany([
        { content: "Post 1", authorId: author1Id },
        { content: "Post 2", authorId: author1Id },
        { content: "Post 3", authorId: author2Id },
      ]);

      // Act
      const result = await postRepository.findByAuthor(author1Id.toString());

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
      expect(result.every(post => post.authorId.toString() === author1Id.toString())).toBe(true);
    });

    it("should return empty array when author has no posts", async () => {
      // Arrange
      const authorWithNoPosts = new ObjectId().toString();

      // Act
      const result = await postRepository.findByAuthor(authorWithNoPosts);

      // Assert
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
    
    it("should respect pagination parameters", async () => {
      // Arrange
      const authorId = new ObjectId();
      
      // Create 15 posts
      const posts = Array(15).fill(0).map((_, i) => ({
        content: `Post ${i}`,
        authorId: authorId,
        createdAt: new Date(Date.now() - i * 1000) // Newer posts first
      }));
      
      await db.collection("posts").insertMany(posts);
      
      // Act - First page (10 posts)
      const page1 = await postRepository.findByAuthor(authorId.toString(), 1, 10);
      
      // Act - Second page (5 posts)
      const page2 = await postRepository.findByAuthor(authorId.toString(), 2, 10);
      
      // Assert
      expect(page1.length).toBe(10);
      expect(page2.length).toBe(5);
      
      // Check ordering - newest first
      for (let i = 0; i < page1.length - 1; i++) {
        expect(page1[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          page1[i + 1].createdAt.getTime()
        );
      }
      
      // Check content of each page
      expect(page1[0].content).toBe("Post 0"); // Newest post on first page
      expect(page2[0].content).toBe("Post 10"); // Continue from page 1
    });
  });

  describe("findAll", () => {
    it("should find all posts with pagination", async () => {
      // Arrange
      const posts = Array(25).fill(0).map((_, i) => ({
        content: `Post ${i}`,
        authorId: new ObjectId(),
        createdAt: new Date(Date.now() - i * 1000), // Newer posts first
        visibility: "public"
      }));
      
      await db.collection("posts").insertMany(posts);
      
      // Act
      const result = await postRepository.findAll(1, 10);
      
      // Assert
      expect(result.posts.length).toBe(10);
      expect(result.hasMore).toBe(true);
      expect(result.totalCount).toBe(25);
      
      // Check that posts are ordered newest first
      for (let i = 0; i < result.posts.length - 1; i++) {
        expect(result.posts[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          result.posts[i + 1].createdAt.getTime()
        );
      }
      
      // Get second page
      const page2 = await postRepository.findAll(2, 10);
      expect(page2.posts.length).toBe(10);
      
      // Get third page
      const page3 = await postRepository.findAll(3, 10);
      expect(page3.posts.length).toBe(5);
      expect(page3.hasMore).toBe(false);
    });
    
    it("should filter posts by visibility", async () => {
      // Arrange
      await db.collection("posts").insertMany([
        { content: "Public post", visibility: "public", createdAt: new Date() },
        { content: "Private post", visibility: "private", createdAt: new Date() },
        { content: "Followers post", visibility: "followers", createdAt: new Date() }
      ]);
      
      // Act - Find only public posts
      const result = await postRepository.findAll(1, 10, ["public"]);
      
      // Assert
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].content).toBe("Public post");
      
      // Act - Find multiple visibility types
      const multiResult = await postRepository.findAll(1, 10, ["public", "followers"]);
      
      // Assert
      expect(multiResult.posts.length).toBe(2);
      expect(multiResult.posts.some(p => p.content === "Public post")).toBe(true);
      expect(multiResult.posts.some(p => p.content === "Followers post")).toBe(true);
    });
  });
  
  describe("update", () => {
    it("should update a post", async () => {
      // Arrange
      const postData = {
        content: "Original content",
        authorId: testActorId
      };
      const insertResult = await db.collection("posts").insertOne(postData);
      const postId = insertResult.insertedId.toString();
      
      // Act
      const updateResult = await postRepository.update(postId, {
        content: "Updated content",
        contentWarning: "Sensitive material"
      });
      
      // Assert
      expect(updateResult).toBe(true);
      
      // Verify update
      const updated = await db.collection("posts").findOne({ _id: new ObjectId(postId) });
      expect(updated?.content).toBe("Updated content");
      expect(updated?.contentWarning).toBe("Sensitive material");
      expect(updated?.authorId).toEqual(testActorId); // Original fields preserved
    });
    
    it("should return false when updating non-existent post", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();
      
      // Act
      const result = await postRepository.update(nonExistentId, {
        content: "This won't work"
      });
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe("delete", () => {
    it("should delete a post", async () => {
      // Arrange
      const postData = {
        content: "Post to delete",
        authorId: testActorId
      };
      const insertResult = await db.collection("posts").insertOne(postData);
      const postId = insertResult.insertedId.toString();
      
      // Act
      const deleteResult = await postRepository.delete(postId);
      
      // Assert
      expect(deleteResult).toBe(true);
      
      // Verify deletion
      const deleted = await db.collection("posts").findOne({ _id: new ObjectId(postId) });
      expect(deleted).toBeNull();
    });
    
    it("should return false when deleting non-existent post", async () => {
      // Arrange
      const nonExistentId = new ObjectId().toString();
      
      // Act
      const result = await postRepository.delete(nonExistentId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
  
  describe("findByTag", () => {
    it("should find posts by tag", async () => {
      // Arrange
      await db.collection("posts").insertMany([
        { content: "Post with #test tag", tags: ["test"], visibility: "public" },
        { content: "Post with #javascript tag", tags: ["javascript"], visibility: "public" },
        { content: "Post with both #test #javascript tags", tags: ["test", "javascript"], visibility: "public" }
      ]);
      
      // Act
      const result = await postRepository.findByTag("test", 1, 10);
      
      // Assert
      expect(result.posts.length).toBe(2);
      expect(result.posts.every(post => post.tags?.includes("test"))).toBe(true);
    });
    
    it("should return empty array when tag not found", async () => {
      // Act
      const result = await postRepository.findByTag("nonexistent", 1, 10);
      
      // Assert
      expect(result.posts.length).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });
  
  describe("findReplies", () => {
    it("should find replies to a post", async () => {
      // Arrange
      const parentPostId = new ObjectId();
      
      await db.collection("posts").insertMany([
        { _id: parentPostId, content: "Parent post", authorId: testActorId },
        { content: "Reply 1", inReplyTo: parentPostId, authorId: testActorId, createdAt: new Date() },
        { content: "Reply 2", inReplyTo: parentPostId, authorId: testActorId, createdAt: new Date() },
        { content: "Not a reply", authorId: testActorId, createdAt: new Date() }
      ]);
      
      // Act
      const result = await postRepository.findReplies(parentPostId.toString());
      
      // Assert
      expect(result.length).toBe(2);
      expect(result.every(post => post.inReplyTo?.toString() === parentPostId.toString())).toBe(true);
    });
    
    it("should return empty array when post has no replies", async () => {
      // Arrange
      const postWithNoReplies = new ObjectId().toString();
      
      // Act
      const result = await postRepository.findReplies(postWithNoReplies);
      
      // Assert
      expect(result.length).toBe(0);
    });
  });
  
  describe("findTrending", () => {
    it("should find trending posts based on likes and reposts", async () => {
      // Arrange
      const post1 = new ObjectId(); // Most popular
      const post2 = new ObjectId(); // Second most popular 
      const post3 = new ObjectId(); // Least popular
      
      await db.collection("posts").insertMany([
        { 
          _id: post1, 
          content: "Popular post", 
          authorId: testActorId,
          visibility: "public",
          likedBy: [new ObjectId(), new ObjectId(), new ObjectId()], // 3 likes
          repostedBy: [new ObjectId(), new ObjectId()], // 2 reposts
          createdAt: new Date()
        },
        {
          _id: post2,
          content: "Semi-popular post",
          authorId: testActorId,
          visibility: "public",
          likedBy: [new ObjectId(), new ObjectId()], // 2 likes
          repostedBy: [new ObjectId()], // 1 repost
          createdAt: new Date()
        },
        {
          _id: post3,
          content: "Unpopular post",
          authorId: testActorId,
          visibility: "public",
          likedBy: [new ObjectId()], // 1 like
          repostedBy: [], // 0 reposts
          createdAt: new Date() 
        }
      ]);
      
      // Act
      const result = await postRepository.findTrending(1, 10);
      
      // Assert
      expect(result.posts.length).toBe(3);
      expect(result.posts[0]._id.toString()).toBe(post1.toString());
      expect(result.posts[1]._id.toString()).toBe(post2.toString());
      expect(result.posts[2]._id.toString()).toBe(post3.toString());
    });
  });
  
  describe("likePost and unlikePost", () => {
    it("should add a user to post's likedBy list", async () => {
      // Arrange
      const postId = new ObjectId();
      const userId = new ObjectId();
      
      await db.collection("posts").insertOne({
        _id: postId,
        content: "Like this post",
        authorId: testActorId,
        likedBy: []
      });
      
      // Act
      const result = await postRepository.likePost(postId.toString(), userId.toString());
      
      // Assert
      expect(result).toBe(true);
      
      // Verify
      const post = await db.collection("posts").findOne({ _id: postId });
      expect(post?.likedBy).toHaveLength(1);
      expect(post?.likedBy[0].toString()).toBe(userId.toString());
    });
    
    it("should remove a user from post's likedBy list", async () => {
      // Arrange
      const postId = new ObjectId();
      const userId = new ObjectId();
      
      await db.collection("posts").insertOne({
        _id: postId,
        content: "Unlike this post",
        authorId: testActorId,
        likedBy: [userId]
      });
      
      // Act
      const result = await postRepository.unlikePost(postId.toString(), userId.toString());
      
      // Assert
      expect(result).toBe(true);
      
      // Verify
      const post = await db.collection("posts").findOne({ _id: postId });
      expect(post?.likedBy).toHaveLength(0);
    });
  });
  
  describe("isLiked", () => {
    it("should return true if user has liked post", async () => {
      // Arrange
      const postId = new ObjectId();
      const userId = new ObjectId();
      
      await db.collection("posts").insertOne({
        _id: postId,
        content: "Already liked post",
        authorId: testActorId,
        likedBy: [userId]
      });
      
      // Act
      const result = await postRepository.isLiked(postId.toString(), userId.toString());
      
      // Assert
      expect(result).toBe(true);
    });
    
    it("should return false if user hasn't liked post", async () => {
      // Arrange
      const postId = new ObjectId();
      const userId = new ObjectId();
      
      await db.collection("posts").insertOne({
        _id: postId,
        content: "Not liked post",
        authorId: testActorId,
        likedBy: []
      });
      
      // Act
      const result = await postRepository.isLiked(postId.toString(), userId.toString());
      
      // Assert
      expect(result).toBe(false);
    });
  });
});