import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto as CommentModelDto } from '../models/comment';
import { AppError, ErrorType } from '@/utils/errors';

// Define DTO locally if needed for input shape, but use Model DTO for service call
interface CreateCommentInput {
  content: string;
}

export class CommentsController {
  constructor(private commentService: CommentService) {}

  async createComment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = req.params.postId;
      const { content } = req.body as CreateCommentInput;
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

      // Pass the full CreateCommentDto required by the service method's type signature
      const commentData: CommentModelDto = {
        postId: postId, // Include postId
        authorId: actorId, // Include authorId
        content: content, // Include content
      };
      const comment = await this.commentService.createComment(
        postId,
        actorId,
        commentData // Pass the complete DTO object
      );
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: Request, res: Response): Promise<Response> {
    const { postId } = req.params;
    const comments = await this.commentService.getComments(postId);
    return res.json(comments);
  }

  async deleteComment(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const deleted = await this.commentService.deleteComment(id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    return res.status(204).end();
  }
}
