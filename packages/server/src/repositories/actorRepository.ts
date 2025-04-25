import { Collection as _Collection, Db, ObjectId } from 'mongodb';
import { Actor } from '@/modules/actors/models/actor';
import { MongoRepository } from './baseRepository';
import { BaseRepository as _BaseRepository } from '@/repositories/baseRepository'; // Assuming base class

export class ActorRepository extends MongoRepository<Actor> {
  constructor(db: Db) {
    super(db, 'actors');

    // Create indexes
    void this.collection.createIndex(
      { preferredUsername: 1 },
      { unique: true }
    );
    void this.collection.createIndex({ id: 1 }, { unique: true });
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
        type: 'Image';
        url: string;
        mediaType: string;
      };
    }
  ): Promise<Actor | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    );
    return result;
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

  async findById(id: string | ObjectId): Promise<Actor | null> {
    try {
      const objectId = typeof id === 'string' ? new ObjectId(id) : id;
      // Pass the ObjectId directly to the filter
      return this.collection.findOne({ _id: objectId });
    } catch (error) {
      // Handle invalid ObjectId strings gracefully
      console.error(`Invalid ObjectId format: ${String(id)}`, error);
      return null;
    }
  }

  async findFollowing(actorId: string, page = 1, limit = 20): Promise<Actor[]> {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following) {
      return [];
    }
    // Map string IDs to ObjectIds for the $in query
    const followingObjectIds = actor.following.map(id => new ObjectId(id));
    const skip = (page - 1) * limit;
    return this.collection
      .find({
        _id: { $in: followingObjectIds },
      })
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async addFollowing(actorId: string, followUserId: string): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId) },
      { $addToSet: { following: followUserId } }
    );
    return result.modifiedCount === 1;
  }

  async removeFollowing(
    actorId: string,
    unfollowUserId: string
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(actorId) },
      { $pull: { following: unfollowUserId } }
    );
    return result.modifiedCount === 1;
  }

  async updateProfileByUsername(
    username: string,
    updates: Partial<Actor>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { preferredUsername: username },
      { $set: updates }
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
      .find({ preferredUsername: { $regex: query, $options: 'i' } })
      .toArray();
  }
}
