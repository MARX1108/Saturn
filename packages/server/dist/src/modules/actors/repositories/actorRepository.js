'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ActorRepository = void 0;
const baseRepository_1 = require('../../shared/repositories/baseRepository');
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
      { _id: id },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }
  async findFollowers(actorId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    // Find actors where the given actorId is in their following list
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
    // Handle following as array in implementation
    const following = Array.isArray(actor.following) ? actor.following : [];
    if (following.length === 0) {
      return [];
    }
    const skip = (page - 1) * limit;
    const followingIds = following.slice(skip, skip + limit);
    return this.collection
      .find({
        _id: { $in: followingIds },
      })
      .toArray();
  }
  async addFollowing(actorId, targetActorId) {
    const result = await this.collection.updateOne(
      { _id: actorId },
      { $addToSet: { following: targetActorId } }
    );
    return result.modifiedCount > 0;
  }
  async removeFollowing(actorId, targetActorId) {
    const result = await this.collection.updateOne(
      { _id: actorId },
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
      .find({
        $or: [
          { preferredUsername: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(20)
      .toArray();
  }
}
exports.ActorRepository = ActorRepository;
