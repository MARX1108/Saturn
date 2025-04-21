import { Db, ObjectId } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Comment } from '../models/comment';

export class CommentRepository extends MongoRepository<Comment> {
  constructor(db: Db) {
    super(db, 'comments');

    // Create indexes for common queries
    this.collection.createIndex({ postId: 1, createdAt: 1 });
    this.collection.createIndex({ authorId: 1 });
    this.collection.createIndex({ createdAt: -1 });
  }

  /**
   * Create a new comment
   */
  async create(data: Omit<Comment, '_id' | 'createdAt'>): Promise<Comment> {
    const comment: Comment = {
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
  async findById(id: string): Promise<Comment | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return this.findOne({ _id: new ObjectId(id) });
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
