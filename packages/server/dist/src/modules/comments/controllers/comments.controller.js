'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CommentsController = void 0;
class CommentsController {
  constructor(commentService) {
    this.commentService = commentService;
  }
  async createComment(req, res) {
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
