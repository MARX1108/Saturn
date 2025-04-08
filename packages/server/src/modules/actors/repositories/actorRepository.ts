import { Db, ObjectId } from "mongodb";
import { Actor } from "../models/actor";
import { MongoRepository } from "../../shared/repositories/baseRepository";

export class ActorRepository extends MongoRepository<Actor> {
  constructor(db: Db) {
    super(db, "actors");

    // Create indexes
    this.collection.createIndex({ preferredUsername: 1 }, { unique: true });
    this.collection.createIndex({ id: 1 }, { unique: true });
  }

  async findByUsername(username: string): Promise<Actor | null> {
    return this.findOne({
      preferredUsername: username,
    });
  }

  async usernameExists(username: string): Promise<boolean> {
    const count = await this.collection.countDocuments({
      preferredUsername: username,
    });
    return count > 0;
  }

  async updateProfile(
    id: string,
    updates: {
      displayName?: string;
      bio?: string;
      icon?: {
        type: "Image";
        url: string;
        mediaType: string;
      };
    },
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
      { $set: updates },
    );
    return result.modifiedCount > 0;
  }

  async findFollowers(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const skip = (page - 1) * limit;

    // Find actors where the given actorId is in their following list
    return this.collection
      .find({
        following: actorId,
      })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async findFollowing(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following) {
      return [];
    }

    // Handle following as array in implementation
    const following = Array.isArray(actor.following) ? actor.following : [];
    if (following.length === 0) {
      return [];
    }

    const skip = (page - 1) * limit;
    const followingIds = following.slice(skip, skip + limit);

    return this.collection
      .find({
        _id: { $in: followingIds },
      })
      .toArray();
  }

  async addFollowing(actorId: string, targetActorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: actorId },
      { $addToSet: { following: targetActorId } },
    );
    return result.modifiedCount > 0;
  }

  async removeFollowing(
    actorId: string,
    targetActorId: string,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: actorId },
      { $pull: { following: targetActorId } },
    );
    return result.modifiedCount > 0;
  }

  async updateProfileByUsername(
    username: string,
    updates: Partial<Actor>,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { preferredUsername: username },
      { $set: updates },
    );
    return result.modifiedCount > 0;
  }

  async deleteByUsername(username: string): Promise<{ deletedCount: number }> {
    const result = await this.collection.deleteOne({
      preferredUsername: username,
    });
    return { deletedCount: result.deletedCount };
  }

  async searchByUsername(query: string): Promise<Actor[]> {
    return this.collection
      .find({
        $or: [
          { preferredUsername: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      })
      .limit(20)
      .toArray();
  }
}
