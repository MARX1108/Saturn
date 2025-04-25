'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureCommentRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
/**
 * Configure comment routes with the controller
 */
function configureCommentRoutes(container) {
  const router = (0, express_1.Router)();
  const commentsController = container.commentsController;
  // Public routes
  router.get('/:postId', (req, res, next) => {
    void commentsController.getComments(req, res).catch(next);
  });
  // Protected routes
  router.post(
    '/',
    (0, auth_1.authenticate)(container.authService),
    (0, routeHandler_1.wrapAsync)((req, res, _next) =>
      commentsController.createComment(req, res, _next)
    )
  );
  router.delete(
    '/:commentId',
    (0, auth_1.authenticate)(container.authService),
    (0, routeHandler_1.wrapAsync)((req, res, _next) =>
      commentsController.deleteComment(req, res)
    )
  );
  return router;
}
