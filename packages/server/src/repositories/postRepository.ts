import { Filter, Db, ObjectId } from "mongodb";
import { Post } from "../types/post";
import { MongoRepository } from "./baseRepository";

export class PostRepository extends MongoRepository<Post> {
  constructor(db: Db) {
    super(db, "posts");
    
    // Create indexes
    this.collection.createIndex({ createdAt: -1 });
    this.collection.createIndex({ actorId: 1 });
  }

  async getPostsByUserId(userId: string, page = 1, limit = 20): Promise<{ posts: Post[], hasMore: boolean }> {
    const skip = (page - 1) * limit;
    
    const posts = await this.collection
      .find({ actorId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .toArray();
    
    const hasMore = posts.length > limit;
    
    if (hasMore) {
      posts.pop(); // Remove the extra item we fetched
    }
    
    return { posts, hasMore };
  }

  async getFeed(page = 1, limit = 20): Promise<{ posts: Post[], hasMore: boolean }> {
    const skip = (page - 1) * limit;
    
    const posts = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit + 1)
      .toArray();
    
    const hasMore = posts.length > limit;
    
    if (hasMore) {
      posts.pop(); // Remove the extra item we fetched
    }
    
    return { posts, hasMore };
  }

  async likePost(postId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likes: 1 } }
    );
    return result.modifiedCount > 0;
  }

  async unlikePost(postId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likes: -1 } }
    );
    return result.modifiedCount > 0;
  }

  async getPostsByUsername(username: string, page = 1, limit = 20, actorCollection = "actors"): Promise<{ posts: Post[], hasMore: boolean }> {
    const actor = await this.collection.database.collection(actorCollection).findOne({
      preferredUsername: username
    });

    if (!actor) {
      return { posts: [], hasMore: false };
    }

    return this.getPostsByUserId(actor._id.toString(), page, limit);
  }

  async isOwner(postId: string, userId: string): Promise<boolean> {
    const post = await this.findOne({
      _id: new ObjectId(postId),
      actorId: new ObjectId(userId)
    });
    return post !== null;
  }
}
