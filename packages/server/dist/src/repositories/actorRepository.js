'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('./baseRepository');
class ActorRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'actors');
    // Create indexes
    this.collection.createIndex({ preferredUsername: 1 }, { unique: true });
    this.collection.createIndex({ id: 1 }, { unique: true });
  }
  async findByUsername(username) {
    return this.findOne({
      preferredUsername: username,
    });
  }
  async usernameExists(username) {
    const count = await this.collection.countDocuments({
      preferredUsername: username,
    });
    return count > 0;
  }
  async updateProfile(id, updates) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(id).toHexString() }, // Convert ObjectId to string
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }
  async findFollowers(actorId, page = 1, limit = 20) {
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
  async findFollowing(actorId, page = 1, limit = 20) {
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
    if (typeof following === 'string') {
      throw new Error('Expected following to be an array, but got a string.');
    }
    const followingIds = following.slice(skip, skip + limit).map(id => id); // Keep as strings
    return this.collection
      .find({
        _id: { $in: followingIds },
      })
      .toArray();
  }
  async addFollowing(actorId, targetActorId) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(actorId).toHexString() }, // Convert ObjectId to string
      { $addToSet: { following: targetActorId } }
    );
    return result.modifiedCount > 0;
  }
  async removeFollowing(actorId, targetActorId) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(actorId).toHexString() }, // Convert ObjectId to string
      { $pull: { following: targetActorId } }
    );
    return result.modifiedCount > 0;
  }
  async updateProfileByUsername(username, updates) {
    const result = await this.collection.updateOne(
      { preferredUsername: username },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }
  async deleteByUsername(username) {
    const result = await this.collection.deleteOne({
      preferredUsername: username,
    });
    return { deletedCount: result.deletedCount };
  }
  async searchByUsername(query) {
    return this.collection
      .find({ preferredUsername: { $regex: query, $options: 'i' } })
      .toArray();
  }
}
exports.ActorRepository = ActorRepository;
