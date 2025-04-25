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
    const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
    // Use findOneAndUpdate to get the updated document, returning the document *after* update
    return this.findOneAndUpdate(
      { _id: objectId }, // Filter by ObjectId
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' } // Option to return the updated document
    );
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
}
exports.ActorRepository = ActorRepository;
