/**
 * Test factories for creating test data
 * 
 * This file contains factory functions to create test entities in the database.
 * Each factory creates a realistic entity with default values that can be overridden.
 */
import { Db, ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';

// Types for test data creation
interface UserCreateOptions {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
  isAdmin?: boolean;
}

interface PostCreateOptions {
  content?: string;
  user?: ObjectId | string;
  visibility?: 'public' | 'private' | 'followers';
}

interface CommentCreateOptions {
  content?: string;
  user?: ObjectId | string;
  post?: ObjectId | string;
}

/**
 * Creates a test user in the database
 * @param db MongoDB database instance
 * @param options User creation options
 */
export async function createTestUser(db: Db, options: UserCreateOptions = {}) {
  const defaultOptions = {
    username: `test-user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!',
    displayName: 'Test User',
    isAdmin: false
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const hashedPassword = await bcrypt.hash(mergedOptions.password, 10);

  const user = {
    _id: new ObjectId(),
    username: mergedOptions.username,
    email: mergedOptions.email,
    password: hashedPassword,
    displayName: mergedOptions.displayName,
    isAdmin: mergedOptions.isAdmin,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('users').insertOne(user);
  return user;
}

/**
 * Creates a test post in the database
 * @param db MongoDB database instance
 * @param options Post creation options
 */
export async function createTestPost(db: Db, options: PostCreateOptions = {}) {
  // If user ID is not provided, create a test user
  let userId = options.user;
  if (!userId) {
    const user = await createTestUser(db);
    userId = user._id;
  }

  const defaultOptions = {
    content: 'This is a test post content',
    visibility: 'public'
  };

  const mergedOptions = { ...defaultOptions, ...options, user: userId };
  
  const post = {
    _id: new ObjectId(),
    content: mergedOptions.content,
    user: typeof userId === 'string' ? new ObjectId(userId) : userId,
    visibility: mergedOptions.visibility,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('posts').insertOne(post);
  return post;
}

/**
 * Creates a test comment in the database
 * @param db MongoDB database instance
 * @param options Comment creation options
 */
export async function createTestComment(db: Db, options: CommentCreateOptions = {}) {
  // If user ID is not provided, create a test user
  let userId = options.user;
  if (!userId) {
    const user = await createTestUser(db);
    userId = user._id;
  }

  // If post ID is not provided, create a test post
  let postId = options.post;
  if (!postId) {
    const post = await createTestPost(db, { user: userId });
    postId = post._id;
  }

  const comment = {
    _id: new ObjectId(),
    content: options.content || 'This is a test comment',
    user: typeof userId === 'string' ? new ObjectId(userId) : userId,
    post: typeof postId === 'string' ? new ObjectId(postId) : postId,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await db.collection('comments').insertOne(comment);
  return comment;
}

/**
 * Creates a test follow relationship in the database
 * @param db MongoDB database instance
 * @param followerId ID of the follower user
 * @param followedId ID of the followed user
 */
export async function createTestFollow(db: Db, followerId?: string | ObjectId, followedId?: string | ObjectId) {
  // Create users if not provided
  if (!followerId) {
    const follower = await createTestUser(db);
    followerId = follower._id;
  }

  if (!followedId) {
    const followed = await createTestUser(db);
    followedId = followed._id;
  }

  const follow = {
    _id: new ObjectId(),
    follower: typeof followerId === 'string' ? new ObjectId(followerId) : followerId,
    followed: typeof followedId === 'string' ? new ObjectId(followedId) : followedId,
    createdAt: new Date()
  };

  await db.collection('follows').insertOne(follow);
  return follow;
}
