import { Collection, Db, ObjectId } from "mongodb";
import { Actor } from "../types/actor";
import { MongoRepository } from "./baseRepository";

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
      { _id: new ObjectId(id).toHexString() }, // Convert ObjectId to string
      { $set: updates },
    );
    return result.modifiedCount > 0;
  }

  async findFollowers(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const skip = (page - 1) * limit;

    // Find actors where the given actorId is in their following list
    // Using string comparison since following might contain string IDs
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

    // Handle following as a string URL in the type but as an array in implementation
    // We need to check if following is actually an array in the database
    const following = Array.isArray(actor.following) ? actor.following : [];
    if (following.length === 0) {
      return [];
    }

    const skip = (page - 1) * limit;
    if (typeof following === "string") {
      throw new Error("Expected following to be an array, but got a string.");
    }

    const followingIds = (following as string[])
      .slice(skip, skip + limit)
      .map((id: string) => id); // Keep as strings

    return this.collection
      .find({
        _id: { $in: followingIds },
      })
      .toArray();
  }

  async addFollowing(actorId: string, targetActorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId).toHexString() }, // Convert ObjectId to string
      { $addToSet: { following: targetActorId } }, // Keep `targetActorId` as a string
    );
    return result.modifiedCount > 0;
  }

  async removeFollowing(
    actorId: string,
    targetActorId: string,
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId).toHexString() }, // Convert ObjectId to string
      { $pull: { following: targetActorId } }, // Keep `targetActorId` as a string
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
      .find({ preferredUsername: { $regex: query, $options: "i" } })
      .toArray();
  }
}
