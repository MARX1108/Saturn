import { Db, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Actor } from '../models/actor';

export class ActorRepository extends MongoRepository<Actor> {
  constructor(db: Db) {
    super(db, 'actors');
    // Ensure indexes are created
    void this.collection.createIndex({ username: 1 }, { unique: true });
    void this.collection.createIndex(
      { preferredUsername: 1 },
      { unique: true }
    );
    void this.collection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );
    void this.collection.createIndex({ id: 1 }, { unique: true });
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
  ): Promise<Actor | null> {
    try {
      console.log(`[ActorRepository] Updating profile for actor ID: ${id}`);
      console.log(`[ActorRepository] Update data:`, JSON.stringify(updates));

      // Convert to ObjectId if needed
      let objectId: ObjectId;
      if (typeof id === 'string') {
        try {
          if (ObjectId.isValid(id)) {
            objectId = new ObjectId(id);
            console.log(
              `[ActorRepository] Successfully converted string to ObjectId: ${objectId}`
            );
          } else {
            console.error(`[ActorRepository] Invalid ObjectId format: ${id}`);
            return null;
          }
        } catch (idError) {
          console.error(
            `[ActorRepository] Error converting ID to ObjectId: ${id}`,
            idError
          );
          return null;
        }
      } else {
        objectId = id;
      }

      // First verify collection name
      console.log(
        `[ActorRepository] Collection name: ${this.collection.collectionName}`
      );
      console.log(
        `[ActorRepository] Collection namespace: ${this.collection.namespace}`
      );

      // Try different query approaches for debugging
      console.log(`[ActorRepository] Finding actor by exact ObjectId`);
      const query = { _id: objectId };

      // Verify the query
      console.log(`[ActorRepository] Query:`, JSON.stringify(query));

      // Do a direct find with just ID to check DB access
      const count = await this.collection.countDocuments();
      console.log(`[ActorRepository] Total documents in collection: ${count}`);

      // Step 1: Find the document first to verify it exists
      const actor = await this.collection.findOne(query);

      if (!actor) {
        console.error(`[ActorRepository] No actor found with ID: ${objectId}`);

        // Try a different approach - find by username using the ID from token
        const actorsByUsername = await this.collection
          .find({})
          .limit(5)
          .toArray();
        console.log(
          '[ActorRepository] First 5 actors in collection:',
          actorsByUsername.map(a => ({
            id: a._id.toString(),
            username: a.preferredUsername,
          }))
        );

        return null;
      }

      console.log(
        `[ActorRepository] Found actor with username: ${actor.preferredUsername}`
      );

      // Step 2: Update the document using updateOne for reliability
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const updateResult = await this.collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (updateResult.modifiedCount === 0) {
        console.error(
          `[ActorRepository] Update operation did not modify any document. ID: ${objectId}`
        );
        return null;
      }

      console.log(
        `[ActorRepository] Successfully updated actor, modified count: ${updateResult.modifiedCount}`
      );

      // Step 3: Fetch the updated document to return
      const updatedActor = await this.collection.findOne({ _id: objectId });

      if (!updatedActor) {
        console.error(
          `[ActorRepository] Could not retrieve updated actor. ID: ${objectId}`
        );
        return null;
      }

      console.log(
        `[ActorRepository] Retrieved updated actor: ${updatedActor.preferredUsername}`
      );
      return updatedActor;
    } catch (error) {
      console.error(
        `[ActorRepository] Error in updateProfile for ID ${id}:`,
        error
      );
      throw error;
    }
  }

  async addFollowing(
    actorId: string | ObjectId,
    targetActorApId: string
  ): Promise<boolean> {
    return this.updateById(actorId, {
      $addToSet: { following: targetActorApId },
    } as UpdateFilter<Actor>);
  }

  async removeFollowing(
    actorId: string | ObjectId,
    targetActorApId: string
  ): Promise<boolean> {
    return this.updateById(actorId, {
      $pull: { following: targetActorApId },
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

  async findById(id: string | ObjectId): Promise<Actor | null> {
    try {
      // If id is an ObjectId already, use it directly
      const objectId = id instanceof ObjectId ? id : new ObjectId(id);

      // Try to find by _id field first
      let result = await this.findOne({ _id: objectId });

      // If not found, try by id field (string representation)
      if (!result) {
        const idStr = objectId.toString();
        result = await this.findOne({ id: idStr } as unknown as Filter<Actor>);
      }

      return result;
    } catch (error) {
      console.error(`[ActorRepository] Error in findById: ${error}`);
      return null;
    }
  }
}
