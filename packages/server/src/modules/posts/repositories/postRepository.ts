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
    this.collection.createIndex({ 'actor.id': 1, createdAt: -1 });
    this.collection.createIndex({ createdAt: -1 });
    this.collection.createIndex({ actorId: 1, published: -1 });
    this.collection.createIndex({ id: 1 }, { unique: true });
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
    console.warn('findFeed not fully implemented - using basic find');
    return this.find({ visibility: 'public' }, options);
  }

  async countFeed(): Promise<number> {
    console.warn('countFeed not fully implemented - using basic count');
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

  async deleteById(id: string): Promise<boolean> {
    const filter = { _id: new ObjectId(id) } as Filter<any>;
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount > 0;
  }
}
