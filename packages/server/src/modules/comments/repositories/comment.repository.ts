import { Db, ObjectId } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Comment } from '../models/comment';

export class CommentRepository extends MongoRepository<Comment> {
  constructor(db: Db) {
    super(db, 'comments');

    // Create indexes for common queries
    void this.collection.createIndex({ postId: 1, createdAt: 1 });
    void this.collection.createIndex({ authorId: 1 });
    void this.collection.createIndex({ createdAt: -1 });
  }

  /**
   * Find comments for a specific post with pagination
   */
  async findCommentsByPostId(
    postId: string,
    options: { limit: number; offset: number }
  ): Promise<{ comments: Comment[]; total: number }> {
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
  async deleteByIdAndAuthorId(
    commentId: string,
    authorId: string
  ): Promise<{ deletedCount: number }> {
    if (!ObjectId.isValid(commentId)) {
      return { deletedCount: 0 };
    }

    const result = await this.collection.deleteOne({
      _id: new ObjectId(commentId),
      authorId,
    });

    return { deletedCount: result.deletedCount };
  }

  /**
   * Count comments for a specific post
   */
  async countByPostId(postId: string): Promise<number> {
    return this.collection.countDocuments({ postId });
  }
}
