'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CommentRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class CommentRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'comments');
    // Create indexes for common queries
    void this.collection.createIndex({ postId: 1, createdAt: 1 });
    void this.collection.createIndex({ authorId: 1 });
    void this.collection.createIndex({ createdAt: -1 });
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
