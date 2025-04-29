import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto as CommentModelDto } from '../models/comment';
import { AppError, ErrorType } from '@/utils/errors';

// Define DTO locally if needed for input shape, but use Model DTO for service call
interface CreateCommentInput {
  content: string;
  postId: string;
}

export class CommentsController {
  constructor(private commentService: CommentService) {}

  async createComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { content, postId } = req.body as CreateCommentInput;
      const actorId = req.user?.id;

      if (!actorId) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      if (!content) {
        throw new AppError(
          'Comment content is required',
          400,
          ErrorType.BAD_REQUEST
        );
      }
      if (!postId) {
        throw new AppError('Post ID is required', 400, ErrorType.BAD_REQUEST);
      }

      // Pass the full CreateCommentDto required by the service method's type signature
      const commentData: CommentModelDto = {
        postId: postId,
        authorId: actorId,
        content: content,
      };
      const comment = await this.commentService.createComment(
        postId,
        actorId,
        commentData
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response): Promise<Response> {
    const { postId } = req.params;

    try {
      // Get pagination parameters with defaults
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const commentsResult = await this.commentService.getCommentsForPost(
        postId,
        { limit, offset }
      );
      return res.status(200).json(commentsResult);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to retrieve comments' });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { commentId } = req.params;

    try {
      const deleted = await this.commentService.deleteComment(
        commentId,
        req.user.id
      );
      if (deleted) {
        return res
          .status(200)
          .json({ message: 'Comment deleted successfully' });
      }
      return res.status(404).json({ error: 'Comment not found' });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
