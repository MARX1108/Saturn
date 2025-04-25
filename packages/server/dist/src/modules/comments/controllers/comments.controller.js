'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CommentsController = void 0;
const errors_1 = require('@/utils/errors');
class CommentsController {
  constructor(commentService) {
    this.commentService = commentService;
  }
  async createComment(req, res, next) {
    try {
      const postId = req.params.postId;
      const { content } = req.body;
      const actorId = req.user?.id;
      if (!actorId) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      if (!content) {
        throw new errors_1.AppError(
          'Comment content is required',
          400,
          errors_1.ErrorType.BAD_REQUEST
        );
      }
      // Pass the full CreateCommentDto required by the service method's type signature
      const commentData = {
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
  async getComments(req, res) {
    const { postId } = req.params;
    const comments = await this.commentService.getComments(postId);
    return res.json(comments);
  }
  async deleteComment(req, res) {
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
exports.CommentsController = CommentsController;
