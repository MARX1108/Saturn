import { Db, ObjectId, Filter, FindOptions, WithId, Condition } from 'mongodb';
import { Actor } from '../models/actor';

export class ActorRepository {
  private readonly collectionName = 'actors';
  private readonly db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  private get collection() {
    return this.db.collection<Actor>(this.collectionName);
  }

  async create(actorData: Omit<Actor, '_id'>): Promise<Actor> {
    const result = await this.collection.insertOne(actorData as Actor);
    // Fetch the created actor using the insertedId
    const newActor = await this.collection.findOne({ _id: result.insertedId });
    if (!newActor) {
      throw new Error('Failed to create or retrieve actor after insertion.');
    }
    return newActor;
  }

  async findById(id: string | ObjectId): Promise<Actor | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return this.collection.findOne({ _id: objectId });
  }

  async findByUsername(username: string): Promise<Actor | null> {
    return this.collection.findOne({ username });
  }

  async findByPreferredUsername(
    preferredUsername: string
  ): Promise<Actor | null> {
    return this.collection.findOne({ preferredUsername });
  }

  async findByEmail(email: string): Promise<Actor | null> {
    return this.collection.findOne({ email });
  }

  async searchActors(query: string): Promise<Actor[]> {
    const regex = new RegExp(query, 'i');
    return this.collection
      .find({
        $or: [
          { username: regex },
          { preferredUsername: regex },
          { displayName: regex },
        ],
      })
      .limit(20) // Add a limit to prevent large results
      .toArray();
  }

  async getFollowing(actorId: string | ObjectId): Promise<Actor[]> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const actor = await this.collection.findOne({ _id: objectId });
    if (!actor || !actor.following || actor.following.length === 0) {
      return [];
    }

    // The `following` array stores ActivityPub IDs (URLs), query by the `id` field
    const followingIds = actor.following; // Use the string IDs directly

    return this.collection
      .find({
        id: { $in: followingIds }, // Query by the `id` field (ActivityPub ID/URL)
      })
      .toArray();
  }

  async addFollower(
    actorId: string | ObjectId,
    followerId: string
  ): Promise<void> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    // Actor's followers list stores follower Actor *URLs* (their ID)
    // We only update the followed actor's document here
    await this.collection.updateOne(
      { _id: objectId }, // Use objectId
      { $addToSet: { followers: followerId } } // Assuming followers stores string IDs (URLs)
    );
  }

  async removeFollower(
    actorId: string | ObjectId,
    followerId: string
  ): Promise<void> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    await this.collection.updateOne(
      { _id: objectId }, // Use objectId
      { $pull: { followers: followerId } } // Assuming followers stores string IDs (URLs)
    );
  }

  // Add following
  async addFollowing(
    actorId: string | ObjectId,
    targetActorId: string // Store target actor's ID (URL)
  ): Promise<void> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    await this.collection.updateOne(
      { _id: objectId },
      { $addToSet: { following: targetActorId } }
    );
  }

  // Remove following
  async removeFollowing(
    actorId: string | ObjectId,
    targetActorId: string // Store target actor's ID (URL)
  ): Promise<void> {
    const objectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    await this.collection.updateOne(
      { _id: objectId },
      { $pull: { following: targetActorId } }
    );
  }

  async updateActor(
    id: string | ObjectId,
    updates: Partial<Actor>
  ): Promise<Actor | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    // Ensure updatedAt is updated
    const updateData = { ...updates, updatedAt: new Date() };
    // Remove _id from updates if present, as it cannot be changed
    delete updateData._id;

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    return result;
  }

  // Find actors by their ActivityPub IDs (URLs)
  async findByIds(ids: string[]): Promise<Actor[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.collection.find({ id: { $in: ids } }).toArray();
  }
}
