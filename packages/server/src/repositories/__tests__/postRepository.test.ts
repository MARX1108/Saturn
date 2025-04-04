import { MongoClient, Db, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostRepository } from '../postRepository';
import { Post } from '../../types/post';

describe('PostRepository', () => {
  let mongoServer: MongoMemoryServer;
  let connection: MongoClient;
  let db: Db;
  let repository: PostRepository;

  beforeAll(async () => {
    // Create a MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    connection = await MongoClient.connect(mongoUri);
    db = connection.db();
    repository = new PostRepository(db);
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await db.collection('posts').deleteMany({});
  });

  it('should create a post', async () => {
    // Arrange
    const actorId = new ObjectId();
    const postData: Post = {
      content: 'Test post',
      actorId,
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/testuser`,
    };

    // Act
    const result = await repository.create(postData);

    // Assert
    expect(result).toHaveProperty('_id');
    expect(result.content).toBe('Test post');
    expect(result.actorId).toEqual(actorId);

    // Verify it's in the database
    const saved = await db.collection('posts').findOne({ _id: result._id });
    expect(saved).not.toBeNull();
    expect(saved?.content).toBe('Test post');
  });

  it('should find a post by id', async () => {
    // Arrange
    const actorId = new ObjectId();
    const post: Post = {
      _id: new ObjectId(),
      content: 'Test find by id',
      actorId,
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/testuser`,
    };
    
    await db.collection('posts').insertOne(post);

    // Act
    const found = await repository.findById(post._id.toString());

    // Assert
    expect(found).not.toBeNull();
    expect(found?._id).toEqual(post._id);
    expect(found?.content).toBe('Test find by id');
  });

  it('should update a post', async () => {
    // Arrange
    const actorId = new ObjectId();
    const post: Post = {
      _id: new ObjectId(),
      content: 'Original content',
      actorId,
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/testuser`,
    };
    
    await db.collection('posts').insertOne(post);

    // Act
    const updated = await repository.update(post._id.toString(), {
      content: 'Updated content',
      sensitive: true,
    });

    // Assert
    expect(updated).toBe(true);

    // Verify in the database
    const found = await db.collection('posts').findOne({ _id: post._id });
    expect(found?.content).toBe('Updated content');
    expect(found?.sensitive).toBe(true);
  });

  it('should delete a post', async () => {
    // Arrange
    const actorId = new ObjectId();
    const post: Post = {
      _id: new ObjectId(),
      content: 'Post to delete',
      actorId,
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/testuser`,
    };
    
    await db.collection('posts').insertOne(post);

    // Act
    const deleted = await repository.delete(post._id.toString());

    // Assert
    expect(deleted).toBe(true);

    // Verify it's gone from the database
    const found = await db.collection('posts').findOne({ _id: post._id });
    expect(found).toBeNull();
  });

  it('should get posts by user ID', async () => {
    // Arrange
    const actorId = new ObjectId();
    const otherActorId = new ObjectId();
    
    // Create 5 posts for our test user and 2 for another user
    const posts: Post[] = Array(5).fill(0).map((_, i) => ({
      _id: new ObjectId(),
      content: `Post ${i + 1}`,
      actorId,
      createdAt: new Date(Date.now() - i * 3600000), // Offset by hours
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/testuser`,
    }));

    const otherPosts: Post[] = Array(2).fill(0).map((_, i) => ({
      _id: new ObjectId(),
      content: `Other Post ${i + 1}`,
      actorId: otherActorId,
      createdAt: new Date(),
      sensitive: false,
      contentWarning: '',
      attachments: [],
      likes: 0,
      replies: 0,
      reposts: 0,
      type: 'Note',
      id: `https://example.com/posts/${new ObjectId()}`,
      attributedTo: `https://example.com/users/otheruser`,
    }));

    await db.collection('posts').insertMany([...posts, ...otherPosts]);

    // Act
    const result = await repository.getPostsByUserId(actorId.toString(), 1, 3);

    // Assert
    expect(result.posts.length).toBe(3); // We requested 3 posts per page
    expect(result.hasMore).toBe(true); // There are 5 posts total, so there are more
    
    // Check that posts are sorted by createdAt desc
    expect(result.posts[0].content).toBe('Post 1');
    expect(result.posts[1].content).toBe('Post 2');
    
    // Check that only posts from the specified actor are returned
    const allFromActor = result.posts.every(post => 
      post.actorId.toString() === actorId.toString()
    );
    expect(allFromActor).toBe(true);
  });
});