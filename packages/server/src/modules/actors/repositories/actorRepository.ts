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
    return this.updateById(id, { $set: updates });
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
}
