'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class PostRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'posts');
    // Create indexes for common queries
    void this.collection.createIndex({ 'actor.id': 1, createdAt: -1 });
    void this.collection.createIndex({ createdAt: -1 });
    void this.collection.createIndex({ actorId: 1, published: -1 });
    void this.collection.createIndex({ id: 1 }, { unique: true });
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
  async findFeed(options) {
    return this.find(
      { visibility: 'public' },
      {
        sort: { published: -1 },
        ...options,
      }
    );
  }
  async countFeed() {
    return this.countDocuments({ visibility: 'public' });
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
  async findPostsByAuthorId(actorId, options) {
    const authorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
    const filter = { actorId: authorObjectId };
    const posts = await this.find(filter, options);
    const total = await this.countDocuments(filter);
    return { posts, total };
  }
  async findByIdAndActorId(postId, actorId) {
    const postObjectId =
      typeof postId === 'string' ? new mongodb_1.ObjectId(postId) : postId;
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
    return this.findOne({
      _id: postObjectId,
      actorId: actorObjectId,
    });
  }
  async isOwner(postId, actorId) {
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
    const post = await this.findOne({ id: postId, actorId: actorObjectId });
    return !!post;
  }
  async update(postId, updates) {
    return this.findOneAndUpdate(
      { id: postId },
      { $set: { ...updates, updatedAt: new Date() } }
    );
  }
  async deleteById(postId) {
    return this.deleteOne({ id: postId });
  }
  async deleteByObjectId(id) {
    const objectId = typeof id === 'string' ? new mongodb_1.ObjectId(id) : id;
    const result = await this.collection.deleteOne({
      _id: objectId,
    });
    return result.deletedCount > 0;
  }
  async findByActorId(actorId, options) {
    const objectId = new mongodb_1.ObjectId(actorId);
    return this.collection
      .find({ actorId: objectId })
      .sort({ createdAt: -1 })
      .skip(options.offset)
      .limit(options.limit)
      .toArray();
  }
  async countByActorId(actorId) {
    const objectId = new mongodb_1.ObjectId(actorId);
    return this.collection.countDocuments({ actorId: objectId });
  }
}
exports.PostRepository = PostRepository;
