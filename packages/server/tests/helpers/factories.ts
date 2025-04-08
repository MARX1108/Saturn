import { Db, ObjectId } from 'mongodb';
import bcryptjs from 'bcryptjs';

// Import types from your modules
// Note: Adjust these import paths if needed based on your project structure
export interface Actor {
  _id?: string | ObjectId;
  id: string;
  type: "Person";
  preferredUsername: string;
  name?: string;
  summary?: string;
  inbox: string;
  outbox: string;
  followers: string;
  following?: string[];
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  privateKey?: string;
  icon?: {
    type: "Image";
    mediaType: string;
    url: string;
  };
  bio?: string;
  createdAt?: Date;
  password?: string;
  "@context"?: string[];
}

export interface Post {
  _id?: string | ObjectId;
  content: string;
  actorId: string | ObjectId;
  createdAt: Date;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: Array<{
    url: string;
    type: string;
    mediaType: string;
  }>;
  likes: number;
  replies: number;
  reposts: number;
  type?: string;
  attributedTo?: string;
  likedBy?: Array<string | ObjectId>;
  id?: string;
}

/**
 * Create a test actor document for testing
 * @param db - MongoDB database instance
 * @param actorData - Optional partial Actor data to override defaults
 * @returns The created Actor document
 */
export async function createTestActor(db: Db, actorData?: Partial<Actor>): Promise<Actor> {
  // Generate a unique username if not provided
  const username = actorData?.preferredUsername || `testuser-${Date.now()}`;
  const domain = 'test.local';
  
  // Default actor data
  const defaultActor: Actor = {
    id: `https://${domain}/users/${username}`,
    type: 'Person',
    preferredUsername: username,
    name: `Test User ${username}`,
    summary: 'This is a test user bio',
    inbox: `https://${domain}/users/${username}/inbox`,
    outbox: `https://${domain}/users/${username}/outbox`,
    followers: `https://${domain}/users/${username}/followers`,
    following: [],
    createdAt: new Date(),
    // Hash a default password for testing
    password: await bcryptjs.hash('testpassword123', 10)
  };

  // Merge defaults with provided data
  const actor = { ...defaultActor, ...actorData };
  
  // Insert into database
  const result = await db.collection('actors').insertOne(actor);
  
  // Get the full document with _id
  const createdActor = await db.collection('actors').findOne({ _id: result.insertedId });
  
  return createdActor as Actor;
}

/**
 * Create a test post document for testing
 * @param db - MongoDB database instance
 * @param postData - Post data with required authorId
 * @returns The created Post document
 */
export async function createTestPost(db: Db, postData: Partial<Post> & { authorId: string | ObjectId }): Promise<Post> {
  const domain = 'test.local';
  
  // Ensure authorId is an ObjectId
  const authorId = typeof postData.authorId === 'string' 
    ? new ObjectId(postData.authorId) 
    : postData.authorId;

  // Generate a post ID
  const postId = new ObjectId();
  
  // Default post data
  const defaultPost: Post = {
    content: `This is test post content ${Date.now()}`,
    actorId: authorId,
    createdAt: new Date(),
    sensitive: false,
    contentWarning: '',
    attachments: [],
    likes: 0,
    replies: 0,
    reposts: 0,
    type: 'Note',
    id: `https://${domain}/posts/${postId}`,
    likedBy: []
  };

  // Look up author to set attributedTo
  const author = await db.collection('actors').findOne({ _id: authorId });
  if (author && author.preferredUsername) {
    defaultPost.attributedTo = `https://${domain}/users/${author.preferredUsername}`;
  }

  // Merge defaults with provided data
  const post = { ...defaultPost, ...postData, actorId: authorId };
  
  // Insert into database
  const result = await db.collection('posts').insertOne(post);
  
  // Get the full document with _id
  const createdPost = await db.collection('posts').findOne({ _id: result.insertedId });
  
  return createdPost as Post;
}

/**
 * Create a like on a post
 * @param db - MongoDB database instance
 * @param userId - ObjectId of the user doing the liking
 * @param postId - ObjectId of the post being liked
 */
export async function createTestLike(db: Db, userId: string | ObjectId, postId: string | ObjectId): Promise<void> {
  // Ensure IDs are ObjectIds
  const userObjId = typeof userId === 'string' ? new ObjectId(userId) : userId;
  const postObjId = typeof postId === 'string' ? new ObjectId(postId) : postId;
  
  // Add the user to the post's likedBy array and increment likes count
  await db.collection('posts').updateOne(
    { _id: postObjId },
    { 
      $addToSet: { likedBy: userObjId },
      $inc: { likes: 1 }
    }
  );
}
