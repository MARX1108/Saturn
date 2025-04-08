import { Filter, Db, ObjectId } from "mongodb";
import { Post } from "../types/post";
import { MongoRepository } from "./baseRepository";

export class PostRepository extends MongoRepository<Post> {
  private db: Db; // Add a `db` property

  constructor(db: Db) {
    super(db, "posts");
    this.db = db; // Store the `Db` instance

    // Create indexes
    this.collection.createIndex({ createdAt: -1 });
    this.collection.createIndex({ actorId: 1 });
  }

  async getPostsByUserId(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      if (!ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
      }

      const skip = (page - 1) * limit;
      const posts = await this.collection
        .find({ actorId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .toArray();

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop();
      }

      return { posts, hasMore };
    } catch (error) {
      console.error("Error in getPostsByUserId:", error);
      throw new Error("Failed to fetch posts by userId");
    }
  }

  async getFeed(
    page = 1,
    limit = 20,
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    try {
      const skip = (page - 1) * limit;
      const posts = await this.collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .toArray();

      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop();
      }

      return { posts, hasMore };
    } catch (error) {
      console.error("Error in getFeed:", error);
      throw new Error("Failed to fetch feed");
    }
  }

  async likePost(postId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(postId)) {
        throw new Error("Invalid postId");
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { likes: 1 } },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error in likePost:", error);
      throw new Error("Failed to like post");
    }
  }

  async unlikePost(postId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(postId)) {
        throw new Error("Invalid postId");
      }

      const result = await this.collection.updateOne(
        { _id: new ObjectId(postId) },
        { $inc: { likes: -1 } },
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error in unlikePost:", error);
      throw new Error("Failed to unlike post");
    }
  }

  async getPostsByUsername(
    username: string,
    page = 1,
    limit = 20,
    actorCollection = "actors",
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const actor = await this.db.collection(actorCollection).findOne({
      preferredUsername: username,
    });

    if (!actor) {
      return { posts: [], hasMore: false };
    }

    return this.getPostsByUserId(actor._id.toString(), page, limit);
  }

  async isOwner(postId: string, userId: string): Promise<boolean> {
    try {
      if (!ObjectId.isValid(postId) || !ObjectId.isValid(userId)) {
        throw new Error("Invalid postId or userId");
      }

      const post = await this.findOne({
        _id: new ObjectId(postId),
        actorId: new ObjectId(userId),
      });
      return post !== null;
    } catch (error) {
      console.error("Error in isOwner:", error);
      throw new Error("Failed to verify ownership");
    }
  }
}
