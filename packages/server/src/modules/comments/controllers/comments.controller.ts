import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { BadRequestError } from '../../../utils/errors';
import { DbUser } from '../../auth/models/user';

// Extend Request to include user property
interface RequestWithUser extends Request {
  user?: DbUser;
}

export class CommentsController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  /**
   * Get comments for a specific post
   */
  async getPostComments(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      const { postId } = req.params;

      // Parse pagination parameters
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      // Validate pagination params
      if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
        throw new BadRequestError('Invalid pagination parameters');
      }

      // Get comments for the post
      const result = await this.commentService.getCommentsForPost(postId, {
        limit,
        offset,
      });

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new comment on a post
   */
  async createPostComment(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get the post ID from URL params
      const { postId } = req.params;

      // Get the comment content from request body
      const { content } = req.body;

      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const authorId = req.user.id;

      // Create the comment
      const comment = await this.commentService.createComment(
        postId,
        authorId,
        content
      );

      return res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment by ID
   */
  async deleteCommentById(
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get the comment ID from URL params
      const { commentId } = req.params;

      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const userId = req.user.id;

      // Delete the comment
      await this.commentService.deleteComment(commentId, userId);

      return res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}
