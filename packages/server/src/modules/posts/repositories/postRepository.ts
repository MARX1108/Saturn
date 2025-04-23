import {
  Db,
  Collection,
  ObjectId,
  Filter,
  UpdateFilter,
  FindOneAndUpdateOptions,
  ModifyResult,
  WithId,
  FindOptions,
} from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Post, Attachment } from '@/modules/posts/models/post';
import { Actor } from '@/modules/actors/models/actor';

export class PostRepository extends MongoRepository<Post> {
  constructor(db: Db) {
    super(db, 'posts');

    // Create indexes for common queries
    void this.collection.createIndex({ 'actor.id': 1, createdAt: -1 });
    void this.collection.createIndex({ createdAt: -1 });
    void this.collection.createIndex({ actorId: 1, published: -1 });
    void this.collection.createIndex({ id: 1 }, { unique: true });
  }

  async findByUsername(
    username: string,
    page = 1,
    limit = 20
  ): Promise<Post[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({
        'actor.username': username,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countByUsername(username: string): Promise<number> {
    return this.collection.countDocuments({
      'actor.username': username,
    });
  }

  async findFeed(options?: FindOptions<Post>): Promise<Post[]> {
    return this.find(
      { visibility: 'public' },
      {
        sort: { published: -1 },
        ...options,
      }
    );
  }

  async countFeed(): Promise<number> {
    return this.countDocuments({ visibility: 'public' });
  }

  async likePost(postId: string, actorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id: postId },
      { $addToSet: { likes: actorId } }
    );
    return result.modifiedCount > 0;
  }

  async unlikePost(postId: string, actorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { id: postId },
      { $pull: { likes: actorId } }
    );
    return result.modifiedCount > 0;
  }

  async findPostsByAuthorId(
    actorId: string | ObjectId,
    options?: FindOptions<Post>
  ): Promise<{ posts: Post[]; total: number }> {
    const authorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const filter = { actorId: authorObjectId };
    const posts = await this.find(filter, options);
    const total = await this.countDocuments(filter);
    return { posts, total };
  }

  async findByIdAndActorId(
    postId: string | ObjectId,
    actorId: string | ObjectId
  ): Promise<Post | null> {
    const postObjectId =
      typeof postId === 'string' ? new ObjectId(postId) : postId;
    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    return this.findOne({
      _id: postObjectId,
      actorId: actorObjectId,
    } as Filter<Post>);
  }

  async isOwner(postId: string, actorId: string | ObjectId): Promise<boolean> {
    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const post = await this.findOne({ id: postId, actorId: actorObjectId });
    return !!post;
  }

  async update(postId: string, updates: Partial<Post>): Promise<Post | null> {
    return this.findOneAndUpdate(
      { id: postId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  async deleteById(postId: string): Promise<boolean> {
    return this.deleteOne({ id: postId });
  }

  async deleteByObjectId(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({
      _id: objectId,
    } as Filter<Post>);
    return result.deletedCount > 0;
  }
}
