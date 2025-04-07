import { Db, ObjectId } from "mongodb";
import { MongoRepository } from "../../shared/repositories/baseRepository";
import { Post } from "../models/post";

export class PostRepository extends MongoRepository<Post> {
  constructor(db: Db) {
    super(db, "posts");
    
    // Create indexes for common queries
    this.collection.createIndex({ "actor.id": 1, createdAt: -1 });
    this.collection.createIndex({ createdAt: -1 });
  }

  async findByUsername(username: string, page = 1, limit = 20): Promise<Post[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({
        "actor.username": username,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countByUsername(username: string): Promise<number> {
    return this.collection.countDocuments({
      "actor.username": username,
    });
  }

  async findFeed(page = 1, limit = 20): Promise<Post[]> {
    const skip = (page - 1) * limit;
    return this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async countFeed(): Promise<number> {
    return this.collection.countDocuments({});
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

  async findById(id: string): Promise<Post | null> {
    return this.findOne({ id });
  }

  async findByIdAndActorId(id: string, actorId: string): Promise<Post | null> {
    return this.findOne({
      id,
      "actor.id": actorId,
    });
  }

  async updateById(id: string, update: Partial<Post>): Promise<Post | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    
    return result || null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}