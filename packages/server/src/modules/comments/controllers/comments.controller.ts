import { Request, Response } from 'express';
import { CommentService } from '../services/comment.service';
import { Comment } from '../models/comment';

export class CommentsController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  async createComment(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { postId, content } = req.body;
    const comment = await this.commentService.createComment(
      postId,
      content,
      req.user.id
    );
    return res.status(201).json(comment);
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
