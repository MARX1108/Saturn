'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('./baseRepository');
class ActorRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'actors');
    // Create indexes
    void this.collection.createIndex(
      { preferredUsername: 1 },
      { unique: true }
    );
    void this.collection.createIndex({ id: 1 }, { unique: true });
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
    const result = await this.collection.findOneAndUpdate(
      { _id: new mongodb_1.ObjectId(id) },
      { $set: updates, $currentDate: { updatedAt: true } },
      { returnDocument: 'after' }
    );
    return result;
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
  async findById(id) {
    try {
      const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
      // Pass the ObjectId directly to the filter
      return this.collection.findOne({ _id: objectId });
    } catch (error) {
      // Handle invalid ObjectId strings gracefully
      console.error(`Invalid ObjectId format: ${String(id)}`, error);
      return null;
    }
  }
  async findFollowing(actorId, page = 1, limit = 20) {
    const actor = await this.findById(actorId);
    if (!actor || !actor.following) {
      return [];
    }
    // Map string IDs to ObjectIds for the $in query
    const followingObjectIds = actor.following.map(
      id => new mongodb_1.ObjectId(id)
    );
    const skip = (page - 1) * limit;
    return this.collection
      .find({
        _id: { $in: followingObjectIds },
      })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  async addFollowing(actorId, followUserId) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(actorId) },
      { $addToSet: { following: followUserId } }
    );
    return result.modifiedCount === 1;
  }
  async removeFollowing(actorId, unfollowUserId) {
    const result = await this.collection.updateOne(
      { _id: new mongodb_1.ObjectId(actorId) },
      { $pull: { following: unfollowUserId } }
    );
    return result.modifiedCount === 1;
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
