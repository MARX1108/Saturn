'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class PostRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'posts');
    // Create indexes for common queries
    this.collection.createIndex({ 'actor.id': 1, createdAt: -1 });
    this.collection.createIndex({ createdAt: -1 });
  }
  async findByUsername(username, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.collection
      .find({
        'actor.username': username,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  async countByUsername(username) {
    return this.collection.countDocuments({
      'actor.username': username,
    });
  }
  async findFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  }
  async countFeed() {
    return this.collection.countDocuments({});
  }
  async likePost(postId, actorId) {
    const result = await this.collection.updateOne(
      { id: postId },
      { $addToSet: { likes: actorId } }
    );
    return result.modifiedCount > 0;
  }
  async unlikePost(postId, actorId) {
    const result = await this.collection.updateOne(
      { id: postId },
      { $pull: { likes: actorId } }
    );
    return result.modifiedCount > 0;
  }
  async findById(id) {
    return this.findOne({ id });
  }
  async findByIdAndActorId(id, actorId) {
    return this.findOne({
      id,
      'actor.id': actorId,
    });
  }
  async updateById(id, update) {
    const filter = { _id: new mongodb_1.ObjectId(id) };
    const updateDoc = {
      $set: { ...update, updatedAt: new Date() },
    };
    const options = { returnDocument: 'after' };
    const result = await this.collection.findOneAndUpdate(
      filter,
      updateDoc,
      options
    );
    return result;
  }
  async deleteById(id) {
    const filter = { _id: new mongodb_1.ObjectId(id) };
    const result = await this.collection.deleteOne(filter);
    return result.deletedCount > 0;
  }
  /**
   * Find posts by author ID with pagination
   *
   * NOTE: This query would benefit from an index on { "actor.id": 1, createdAt: -1 }
   * for efficient querying and sorting
   */
  async findPostsByAuthorId(authorId, options) {
    const { limit, offset } = options;
    // Query filter
    const filter = { 'actor.id': authorId };
    // Get posts with pagination and sorting
    const posts = await this.collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    // Get total count for pagination
    const total = await this.collection.countDocuments(filter);
    return { posts, total };
  }
}
exports.PostRepository = PostRepository;
