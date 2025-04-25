'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('./baseRepository');
class PostRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'posts');
    this.db = db; // Store the `Db` instance
    // Create indexes
    void this.collection.createIndex({ createdAt: -1 });
    void this.collection.createIndex({ actorId: 1 });
  }
  async getPostsByUserId(userId, page = 1, limit = 20) {
    try {
      if (!mongodb_1.ObjectId.isValid(userId)) {
        throw new Error('Invalid userId');
      }
      const skip = (page - 1) * limit;
      const posts = await this.collection
        .find({ actorId: new mongodb_1.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .toArray();
      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop();
      }
      return { posts, hasMore };
    } catch (error) {
      console.error('Error in getPostsByUserId:', error);
      throw new Error('Failed to fetch posts by userId');
    }
  }
  async getFeed(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      const posts = await this.collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit + 1)
        .toArray();
      const hasMore = posts.length > limit;
      if (hasMore) {
        posts.pop();
      }
      return { posts, hasMore };
    } catch (error) {
      console.error('Error in getFeed:', error);
      throw new Error('Failed to fetch feed');
    }
  }
  async likePost(postId) {
    try {
      if (!mongodb_1.ObjectId.isValid(postId)) {
        throw new Error('Invalid postId');
      }
      const result = await this.collection.updateOne(
        { _id: new mongodb_1.ObjectId(postId) },
        { $inc: { likes: 1 } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in likePost:', error);
      throw new Error('Failed to like post');
    }
  }
  async unlikePost(postId) {
    try {
      if (!mongodb_1.ObjectId.isValid(postId)) {
        throw new Error('Invalid postId');
      }
      const result = await this.collection.updateOne(
        { _id: new mongodb_1.ObjectId(postId) },
        { $inc: { likes: -1 } }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error in unlikePost:', error);
      throw new Error('Failed to unlike post');
    }
  }
  async getPostsByUsername(
    username,
    page = 1,
    limit = 20,
    actorCollection = 'actors'
  ) {
    const actor = await this.db.collection(actorCollection).findOne({
      preferredUsername: username,
    });
    if (!actor) {
      return { posts: [], hasMore: false };
    }
    return this.getPostsByUserId(actor._id.toString(), page, limit);
  }
  async isOwner(postId, userId) {
    try {
      if (
        !mongodb_1.ObjectId.isValid(postId) ||
        !mongodb_1.ObjectId.isValid(userId)
      ) {
        throw new Error('Invalid postId or userId');
      }
      const post = await this.findOne({
        _id: new mongodb_1.ObjectId(postId),
        actorId: new mongodb_1.ObjectId(userId),
      });
      return post !== null;
    } catch (error) {
      console.error('Error in isOwner:', error);
      throw new Error('Failed to verify ownership');
    }
  }
}
exports.PostRepository = PostRepository;
