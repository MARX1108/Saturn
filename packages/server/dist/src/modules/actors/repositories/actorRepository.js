'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class ActorRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
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
  async findByUsername(username) {
    // Finds by full username (user@domain)
    return this.findOne({ username: username });
  }
  async findByPreferredUsername(preferredUsername) {
    // Finds by local username part
    return this.findOne({ preferredUsername: preferredUsername });
  }
  async updateProfile(id, updates) {
    try {
      console.log(`[ActorRepository] Updating profile for actor ID: ${id}`);
      console.log(`[ActorRepository] Update data:`, JSON.stringify(updates));
      // Convert to ObjectId if needed
      let objectId;
      if (typeof id === 'string') {
        try {
          if (mongodb_1.ObjectId.isValid(id)) {
            objectId = new mongodb_1.ObjectId(id);
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
  async addFollowing(actorId, targetActorApId) {
    return this.updateById(actorId, {
      $addToSet: { following: targetActorApId },
    });
  }
  async removeFollowing(actorId, targetActorApId) {
    return this.updateById(actorId, {
      $pull: { following: targetActorApId },
    });
  }
  // Add usernameExists method
  async usernameExists(preferredUsername) {
    const count = await this.countDocuments({ preferredUsername });
    return count > 0;
  }
  // Add findFollowers method
  async findFollowers(actorApId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    // Find actors where actorApId is in their following list
    return this.find({ following: actorApId }, { skip, limit });
  }
  // Add findFollowing method (based on ActorService logic)
  async findFollowing(actorId, page = 1, limit = 20) {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following || actor.following.length === 0) return [];
    const skip = (page - 1) * limit;
    // Find actors whose AP IDs are in the actor's following list
    return this.find({ id: { $in: actor.following } }, { skip, limit });
  }
  // Add search method
  async search(query, limit = 10) {
    if (!query) {
      return [];
    }
    // Simple search by preferredUsername or displayName (case-insensitive)
    const filter = {
      $or: [
        { preferredUsername: { $regex: query, $options: 'i' } },
        { displayName: { $regex: query, $options: 'i' } },
      ],
    };
    return this.find(filter, { limit });
  }
  // Add updateProfileByUsername method
  async updateProfileByUsername(preferredUsername, updates) {
    return this.findOneAndUpdate(
      { preferredUsername },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }
  // Add deleteByUsername method
  async deleteByUsername(preferredUsername) {
    return this.deleteOne({ preferredUsername });
  }
  async findById(id) {
    try {
      // If id is an ObjectId already, use it directly
      const objectId =
        id instanceof mongodb_1.ObjectId ? id : new mongodb_1.ObjectId(id);
      // Try to find by _id field first
      let result = await this.findOne({ _id: objectId });
      // If not found, try by id field (string representation)
      if (!result) {
        const idStr = objectId.toString();
        result = await this.findOne({ id: idStr });
      }
      return result;
    } catch (error) {
      console.error(`[ActorRepository] Error in findById: ${error}`);
      return null;
    }
  }
}
exports.ActorRepository = ActorRepository;
