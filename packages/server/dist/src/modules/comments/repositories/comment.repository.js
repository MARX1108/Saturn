'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CommentRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class CommentRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'comments');
    // Create indexes for common queries
    this.collection.createIndex({ postId: 1, createdAt: 1 });
    this.collection.createIndex({ authorId: 1 });
    this.collection.createIndex({ createdAt: -1 });
  }
  /**
   * Create a new comment
   */
  async create(data) {
    const comment = {
      ...data,
      createdAt: new Date(),
    };
    const result = await this.collection.insertOne(comment);
    return {
      ...comment,
      _id: result.insertedId.toString(),
    };
  }
  /**
   * Find a comment by ID
   */
  async findById(id) {
    if (!mongodb_1.ObjectId.isValid(id)) {
      return null;
    }
    return this.findOne({ _id: new mongodb_1.ObjectId(id) });
  }
  /**
   * Find comments for a specific post with pagination
   */
  async findCommentsByPostId(postId, options) {
    const { limit, offset } = options;
    // Get comments with pagination and sorting (oldest first by default)
    const comments = await this.collection
      .find({ postId })
      .sort({ createdAt: 1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    // Get total count for pagination
    const total = await this.collection.countDocuments({ postId });
    return { comments, total };
  }
  /**
   * Delete a comment by ID only if it belongs to the specified author
   */
  async deleteByIdAndAuthorId(commentId, authorId) {
    if (!mongodb_1.ObjectId.isValid(commentId)) {
      return { deletedCount: 0 };
    }
    const result = await this.collection.deleteOne({
      _id: new mongodb_1.ObjectId(commentId),
      authorId,
    });
    return { deletedCount: result.deletedCount };
  }
  /**
   * Count comments for a specific post
   */
  async countByPostId(postId) {
    return this.collection.countDocuments({ postId });
  }
}
exports.CommentRepository = CommentRepository;
