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
        url: string;
        mediaType: string;
      };
    }
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }
  
  async findFollowers(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const skip = (page - 1) * limit;
    
    // Find actors where the given actorId is in their following list
    return this.collection
      .find({
        following: { $elemMatch: { $eq: new ObjectId(actorId) } }
      })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  
  async findFollowing(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following || actor.following.length === 0) {
      return [];
    }
    
    const skip = (page - 1) * limit;
    const followingIds = actor.following.slice(skip, skip + limit);
    
    return this.collection
      .find({
        _id: { $in: followingIds }
      })
      .toArray();
  }
  
  async addFollowing(actorId: string, targetActorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId) },
      { $addToSet: { following: new ObjectId(targetActorId) } }
    );
    return result.modifiedCount > 0;
  }
  
  async removeFollowing(actorId: string, targetActorId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId) },
      { $pull: { following: new ObjectId(targetActorId) } }
    );
    return result.modifiedCount > 0;
  }
}
