'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureCommentRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
const validateRequest_1 = require('../../../middleware/validateRequest');
const comments_schemas_1 = require('../schemas/comments.schemas');
/**
 * Configure comment routes with the controller
 */
function configureCommentRoutes(container) {
  const router = (0, express_1.Router)();
  const commentsController = container.commentsController;
  // Public routes
  router.get(
    '/:postId',
    (0, validateRequest_1.validateRequestParams)(
      comments_schemas_1.postIdParamSchema
    ),
    (0, validateRequest_1.validateRequestQuery)(
      comments_schemas_1.routeCommentsQuerySchema
    ),
    (0, routeHandler_1.wrapAsync)((req, res) =>
      commentsController.getComments(req, res)
    )
  );
  // Protected routes
  router.post(
    '/',
    (0, auth_1.authenticate)(container.authService),
    (0, routeHandler_1.wrapAsync)((req, res, next) =>
      commentsController.createComment(req, res, next)
    )
  );
  router.delete(
    '/:commentId',
    (0, auth_1.authenticate)(container.authService),
    (0, validateRequest_1.validateRequestParams)(
      comments_schemas_1.commentIdParamSchema
    ),
    (0, routeHandler_1.wrapAsync)((req, res) =>
      commentsController.deleteComment(req, res)
    )
  );
  return router;
}
