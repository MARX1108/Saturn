'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configurePostRoutes;
const express_1 = require('express');
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
const validateRequest_1 = require('../../../middleware/validateRequest');
const post_schema_1 = require('../schemas/post.schema');
const rateLimiter_1 = require('../../../middleware/rateLimiter');
const posts_schemas_1 = require('../schemas/posts.schemas');
const comments_schemas_1 = require('../../comments/schemas/comments.schemas');
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
  // Apply default rate limiter to all routes
  router.use(rateLimiter_1.defaultRateLimiter);
  // Public routes using wrapAsync
  // Pass authService to authenticate middleware factory
  router.get(
    '/',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestQuery)(
      posts_schemas_1.routeFeedQuerySchema
    ),
    (0, routeHandler_1.wrapAsync)(boundGetFeed)
  );
  router.get(
    '/:id',
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    (0, routeHandler_1.wrapAsync)(boundGetPostById)
  );
  router.get(
    '/users/:username',
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.usernameParamSchema
    ),
    (0, validateRequest_1.validateRequestQuery)(
      posts_schemas_1.routeFeedQuerySchema
    ),
    (0, routeHandler_1.wrapAsync)(boundGetPostsByUsername)
  );
  // Protected routes using wrapAsync with rate limiting
  // Pass authService to authenticate middleware factory
  router.post(
    '/',
    (0, auth_1.authenticate)(authService),
    rateLimiter_1.createPostRateLimiter, // Apply stricter rate limiting for post creation
    (0, validateRequest_1.validateRequestBody)(post_schema_1.createPostSchema),
    (0, routeHandler_1.wrapAsync)(boundCreatePost)
  );
  router.put(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    (0, validateRequest_1.validateRequestBody)(post_schema_1.updatePostSchema),
    (0, routeHandler_1.wrapAsync)(boundUpdatePost)
  );
  router.delete(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    (0, routeHandler_1.wrapAsync)(boundDeletePost)
  );
  // Apply engagement rate limiting to like/unlike routes
  router.post(
    '/:id/like',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    rateLimiter_1.engagementRateLimiter,
    (0, routeHandler_1.wrapAsync)(boundLikePost)
  );
  router.post(
    '/:id/unlike',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    rateLimiter_1.engagementRateLimiter,
    (0, routeHandler_1.wrapAsync)(boundUnlikePost)
  );
  // Comment routes using wrapAsync
  // Pass authService to authenticate middleware factory
  router.get(
    '/:id/comments',
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    (0, routeHandler_1.wrapAsync)(boundGetComments)
  );
  router.post(
    '/:id/comments',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      posts_schemas_1.postIdParamSchema
    ),
    rateLimiter_1.engagementRateLimiter, // Apply rate limiting to comment creation
    (0, routeHandler_1.wrapAsync)(boundCreateComment)
  );
  router.delete(
    '/comments/:id',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestParams)(
      comments_schemas_1.commentIdParamSchema
    ),
    (0, routeHandler_1.wrapAsync)(boundDeleteComment)
  );
  return router;
}
