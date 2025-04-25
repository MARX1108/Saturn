import {
  Router,
  Request as _Request,
  Response as _Response,
  NextFunction as _NextFunction,
} from 'express';
import { PostsController as _PostsController } from '../controllers/postsController';
import { CommentsController as _CommentsController } from '../../comments/controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService as _AuthService } from '../../auth/services/auth.service';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';
import { validateRequestBody } from '../../../middleware/validateRequest';
import { createPostSchema, updatePostSchema } from '../schemas/post.schema';
import {
  createPostRateLimiter,
  engagementRateLimiter,
  defaultRateLimiter,
} from '../../../middleware/rateLimiter';

/**
 * Configure post routes with the controller
 */
export default function configurePostRoutes(
  container: ServiceContainer
): Router {
  const router = Router();
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
  router.use(defaultRateLimiter);

  // Public routes using wrapAsync
  // Pass authService to authenticate middleware factory

  router.get('/', authenticate(authService), wrapAsync(boundGetFeed));

  router.get('/:id', wrapAsync(boundGetPostById));

  router.get('/users/:username', wrapAsync(boundGetPostsByUsername));

  // Protected routes using wrapAsync with rate limiting
  // Pass authService to authenticate middleware factory

  router.post(
    '/',
    authenticate(authService),
    createPostRateLimiter, // Apply stricter rate limiting for post creation
    validateRequestBody(createPostSchema),
    wrapAsync(boundCreatePost)
  );

  router.put(
    '/:id',
    authenticate(authService),
    validateRequestBody(updatePostSchema),
    wrapAsync(boundUpdatePost)
  );

  router.delete('/:id', authenticate(authService), wrapAsync(boundDeletePost));

  // Apply engagement rate limiting to like/unlike routes
  router.post(
    '/:id/like',
    authenticate(authService),
    engagementRateLimiter,
    wrapAsync(boundLikePost)
  );

  router.post(
    '/:id/unlike',
    authenticate(authService),
    engagementRateLimiter,
    wrapAsync(boundUnlikePost)
  );

  // Comment routes using wrapAsync
  // Pass authService to authenticate middleware factory

  router.get('/:id/comments', wrapAsync(boundGetComments));

  router.post(
    '/:id/comments',
    authenticate(authService),
    engagementRateLimiter, // Apply rate limiting to comment creation
    wrapAsync(boundCreateComment)
  );

  router.delete(
    '/comments/:id',
    authenticate(authService),
    wrapAsync(boundDeleteComment)
  );

  return router;
}
