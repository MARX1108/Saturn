import { Router, Request, Response, NextFunction } from 'express';
import { PostsController } from '../controllers/postsController';
import { CommentsController } from '../../comments/controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService } from '../../auth/services/auth.service';
import { ServiceContainer } from '../../../utils/container';

// Async Handler Wrapper
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Configure post routes with the controller
 */
export default function configurePostRoutes(
  container: ServiceContainer
): Router {
  console.log('[[configurePostRoutes]] Function executing...');
  console.trace('configurePostRoutes TRACE');
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

  // Public routes using asyncHandler
  // Pass authService to authenticate middleware factory
  router.get('/', authenticate(authService), asyncHandler(boundGetFeed));
  router.get('/:id', asyncHandler(boundGetPostById));
  router.get('/users/:username', asyncHandler(boundGetPostsByUsername));

  // Protected routes using asyncHandler
  // Pass authService to authenticate middleware factory
  router.post('/', authenticate(authService), asyncHandler(boundCreatePost));
  router.put('/:id', authenticate(authService), asyncHandler(boundUpdatePost));
  router.delete(
    '/:id',
    authenticate(authService),
    asyncHandler(boundDeletePost)
  );
  router.post(
    '/:id/like',
    authenticate(authService),
    asyncHandler(boundLikePost)
  );
  router.post(
    '/:id/unlike',
    authenticate(authService),
    asyncHandler(boundUnlikePost)
  );

  // Comment routes using asyncHandler
  // Pass authService to authenticate middleware factory
  router.get('/:id/comments', asyncHandler(boundGetComments));
  router.post(
    '/:id/comments',
    authenticate(authService),
    asyncHandler(boundCreateComment)
  );
  router.delete(
    '/comments/:id',
    authenticate(authService),
    asyncHandler(boundDeleteComment)
  );

  return router;
}
