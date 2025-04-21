import { Db, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Actor } from '@/modules/actors/models/actor';

export class ActorRepository extends MongoRepository<Actor> {
  constructor(db: Db) {
    super(db, 'actors');
    // Ensure indexes are created
    this.collection.createIndex({ username: 1 }, { unique: true });
    this.collection.createIndex({ preferredUsername: 1 }, { unique: true });
    this.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    this.collection.createIndex({ id: 1 }, { unique: true });
  }

  // Specific methods needed beyond base repository

  async findByUsername(username: string): Promise<Actor | null> {
    // Finds by full username (user@domain)
    return this.findOne({ username: username });
  }

  async findByPreferredUsername(
    preferredUsername: string
  ): Promise<Actor | null> {
    // Finds by local username part
    return this.findOne({ preferredUsername: preferredUsername });
  }

  async updateProfile(
    id: string | ObjectId,
    updates: Partial<Pick<Actor, 'displayName' | 'summary' | 'icon'>>
  ): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    // Use ObjectId directly in the filter
    return this.updateById(objectId, { $set: updates });
  }

  async addFollowing(
    actorId: string | ObjectId,
    targetActorId: string
  ): Promise<boolean> {
    return this.updateById(actorId, {
      $addToSet: { following: targetActorId },
    } as UpdateFilter<Actor>);
  }

  async removeFollowing(
    actorId: string | ObjectId,
    targetActorId: string
  ): Promise<boolean> {
    return this.updateById(actorId, {
      $pull: { following: targetActorId },
    } as UpdateFilter<Actor>);
  }

  // Add usernameExists method
  async usernameExists(preferredUsername: string): Promise<boolean> {
    const count = await this.countDocuments({ preferredUsername });
    return count > 0;
  }

  // Add findFollowers method
  async findFollowers(
    actorApId: string,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
    const skip = (page - 1) * limit;
    // Find actors where actorApId is in their following list
    return this.find({ following: actorApId }, { skip, limit });
  }

  // Add findFollowing method (based on ActorService logic)
  async findFollowing(
    actorId: string | ObjectId,
    page = 1,
    limit = 20
  ): Promise<Actor[]> {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following || actor.following.length === 0) return [];

    const skip = (page - 1) * limit;
    // Find actors whose AP IDs are in the actor's following list
    return this.find({ id: { $in: actor.following } }, { skip, limit });
  }

  // Add search method
  async search(query: string, limit = 10): Promise<Actor[]> {
    if (!query) {
      return [];
    }
    // Simple search by preferredUsername or displayName (case-insensitive)
    const filter: Filter<Actor> = {
      $or: [
        { preferredUsername: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
      ],
    };
    return this.find(filter, { limit });
  }

  // Add updateProfileByUsername method
  async updateProfileByUsername(
    preferredUsername: string,
    updates: Partial<Actor>
  ): Promise<Actor | null> {
    return this.findOneAndUpdate(
      { preferredUsername },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }

  // Add deleteByUsername method
  async deleteByUsername(preferredUsername: string): Promise<boolean> {
    return this.deleteOne({ preferredUsername });
  }
}
