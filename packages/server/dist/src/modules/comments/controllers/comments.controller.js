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
      const { content, postId } = req.body;
      const actorId = req.user?.id;
      if (!actorId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      if (!content) {
        throw new errors_1.AppError(
          'Comment content is required',
          400,
          errors_1.ErrorType.BAD_REQUEST
        );
      }
      if (!postId) {
        throw new errors_1.AppError(
          'Post ID is required',
          400,
          errors_1.ErrorType.BAD_REQUEST
        );
      }
      // Pass the full CreateCommentDto required by the service method's type signature
      const commentData = {
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
  async getComments(req, res) {
    const { postId } = req.params;
    try {
      // Get pagination parameters with defaults
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const commentsResult = await this.commentService.getCommentsForPost(
        postId,
        { limit, offset }
      );
      return res.status(200).json(commentsResult);
    } catch (error) {
      if (error instanceof errors_1.AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to retrieve comments' });
    }
  }
  async deleteComment(req, res) {
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
      if (error instanceof errors_1.AppError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}
exports.CommentsController = CommentsController;
