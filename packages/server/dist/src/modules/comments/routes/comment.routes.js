'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureCommentRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
/**
 * Configure comment routes with the controller
 */
function configureCommentRoutes(container) {
  const router = (0, express_1.Router)();
  const commentsController = container.commentsController;
  // Public routes
  router.get('/:postId', (req, res, next) => {
    commentsController.getComments(req, res).catch(next);
  });
  // Protected routes
  router.post(
    '/',
    (0, auth_1.authenticate)(container.authService),
    (req, res, next) => {
      commentsController.createComment(req, res).catch(next);
    }
  );
  router.delete(
    '/:commentId',
    (0, auth_1.authenticate)(container.authService),
    (req, res, next) => {
      commentsController.deleteComment(req, res).catch(next);
    }
  );
  return router;
}
