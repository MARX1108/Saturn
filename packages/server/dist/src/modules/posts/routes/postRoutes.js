'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configurePostRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
/**
 * Configure post routes with the controller
 */
function configurePostRoutes(container) {
  const router = (0, express_1.Router)();
  // Ensure all required services AND controllers are retrieved
  const {
    // postService, // Not needed directly if using mocked controller
    // actorService,
    // uploadService,
    commentsController, // Keep for comment routes
    authService, // Keep for authenticate middleware
    // domain, // Not needed directly
    postsController, // <<< GET Controller from container
  } = container;
  // Ensure postsController exists
  if (!postsController) {
    throw new Error('PostsController not found in service container');
  }
  if (!commentsController) {
    throw new Error('CommentsController not found in service container');
  }
  // Bind controller methods from the MOCKED controller
  const boundGetFeed = postsController.getFeed.bind(postsController);
  const boundGetPostById = postsController.getPostById.bind(postsController);
  const boundGetPostsByUsername =
    postsController.getPostsByUsername.bind(postsController);
  const boundCreatePost = postsController.createPost.bind(postsController);
  const boundUpdatePost = postsController.updatePost.bind(postsController);
  const boundDeletePost = postsController.deletePost.bind(postsController);
  const boundLikePost = postsController.likePost.bind(postsController);
  const boundUnlikePost = postsController.unlikePost.bind(postsController);
  // Bind comment controller methods
  const boundGetComments =
    commentsController.getComments.bind(commentsController);
  const boundCreateComment =
    commentsController.createComment.bind(commentsController);
  const boundDeleteComment =
    commentsController.deleteComment.bind(commentsController);
  // Public routes using wrapAsync
  // Pass authService to authenticate middleware factory
  router.get(
    '/',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundGetFeed)
  );
  router.get('/:id', (0, routeHandler_1.wrapAsync)(boundGetPostById));
  router.get(
    '/users/:username',
    (0, routeHandler_1.wrapAsync)(boundGetPostsByUsername)
  );
  // Protected routes using wrapAsync
  // Pass authService to authenticate middleware factory
  router.post(
    '/',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundCreatePost)
  );
  router.put(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundUpdatePost)
  );
  router.delete(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundDeletePost)
  );
  router.post(
    '/:id/like',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundLikePost)
  );
  router.post(
    '/:id/unlike',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundUnlikePost)
  );
  // Comment routes using wrapAsync
  // Pass authService to authenticate middleware factory
  router.get('/:id/comments', (0, routeHandler_1.wrapAsync)(boundGetComments));
  router.post(
    '/:id/comments',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundCreateComment)
  );
  router.delete(
    '/comments/:id',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(boundDeleteComment)
  );
  return router;
}
