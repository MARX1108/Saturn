import { Db, ObjectId, Filter, UpdateFilter, FindOptions } from 'mongodb';
import { Post } from '../models/post';
import { Actor } from '@/modules/actors/models/actor';

export class PostRepository {
  private readonly collectionName = 'posts';
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  private get collection() {
    return this.db.collection<Post>(this.collectionName);
  }

  async create(postData: Omit<Post, '_id'>): Promise<Post> {
    const result = await this.collection.insertOne(postData as Post);
    // Fetch the created post using the insertedId
    const newPost = await this.collection.findOne({ _id: result.insertedId });
    if (!newPost) {
      throw new Error('Failed to create or retrieve post after insertion.');
    }
    return newPost;
  }

  async findById(postId: string | ObjectId): Promise<Post | null> {
    const objectId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    return this.collection.findOne({ _id: objectId });
  }

  async findByActorId(
    actorId: string | ObjectId,
    options?: FindOptions<Post>
  ): Promise<Post[]> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    return this.collection.find({ actorId: objectId }, options).toArray();
  }

  async getFeed(
    actorIds: ObjectId[],
    limit: number,
    cursor?: string
  ): Promise<Post[]> {
    const query: Filter<Post> = { actorId: { $in: actorIds } };
    if (cursor) {
      query._id = { $lt: new ObjectId(cursor) };
    }

    return this.collection.find(query).sort({ _id: -1 }).limit(limit).toArray();
  }

  async updatePost(
    postId: string | ObjectId,
    updates: Partial<Post>
  ): Promise<Post | null> {
    const objectId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    return result;
  }

  async deletePost(postId: string | ObjectId): Promise<boolean> {
    const objectId = typeof postId === 'string' ? new ObjectId(postId) : postId;
    const result = await this.collection.deleteOne({ _id: objectId });
    return result.deletedCount === 1;
  }

  async likePost(postId: string | ObjectId, actorId: ObjectId): Promise<void> {
    const postObjectId =
      typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: postObjectId },
      { $addToSet: { likedBy: actorId }, $inc: { likes: 1 } } // Correct: Modify likedBy array and likes count
    );
  }

  async unlikePost(
    postId: string | ObjectId,
    actorId: ObjectId
  ): Promise<void> {
    const postObjectId =
      typeof postId === 'string' ? new ObjectId(postId) : postId;
    await this.collection.updateOne(
      { _id: postObjectId },
      { $pull: { likedBy: actorId }, $inc: { likes: -1 } } // Correct: Modify likedBy array and likes count
    );
  }

  // Find posts that mention a specific actor ID (URL)
  async findMentions(actorId: string): Promise<Post[]> {
    // This requires a more complex query, potentially involving regex on content
    // or a dedicated mentions array field.
    // Placeholder implementation:
    // const regex = new RegExp(`@${actorId}`, 'i'); // Basic check
    // return this.collection.find({ content: regex }).toArray();
    console.warn('findMentions not fully implemented');
    return [];
  }

  // Aggregate function to get posts with author details
  async findPostsWithAuthors(
    filter: Filter<Post>,
    options?: FindOptions<Post>
  ): Promise<Post[]> {
    return this.collection
      .aggregate<Post>([
        { $match: filter },
        {
          $lookup: {
            from: 'actors',
            localField: 'actorId',
            foreignField: '_id',
            as: 'actorDetails',
          },
        },
        {
          $unwind: {
            path: '$actorDetails',
            preserveNullAndEmptyArrays: true, // Keep posts even if author is somehow missing
          },
        },
        { $addFields: { actor: '$actorDetails' } }, // Add actor object directly
        { $project: { actorDetails: 0 } }, // Remove temporary field
        { $sort: options?.sort || { _id: -1 } },
        { $limit: options?.limit || 20 },
      ])
      .toArray();
  }
}
