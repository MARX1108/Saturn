/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router, Request, Response, NextFunction } from 'express';
import { PostsController } from '../controllers/postsController';
import { CommentsController } from '../../comments/controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService } from '../../auth/services/auth.service';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';

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

  // Public routes using wrapAsync
  // Pass authService to authenticate middleware factory
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/', authenticate(authService), wrapAsync(boundGetFeed));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/:id', wrapAsync(boundGetPostById));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/users/:username', wrapAsync(boundGetPostsByUsername));

  // Protected routes using wrapAsync
  // Pass authService to authenticate middleware factory
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/', authenticate(authService), wrapAsync(boundCreatePost));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.put('/:id', authenticate(authService), wrapAsync(boundUpdatePost));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.delete('/:id', authenticate(authService), wrapAsync(boundDeletePost));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/:id/like', authenticate(authService), wrapAsync(boundLikePost));
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post(
    '/:id/unlike',
    authenticate(authService),
    wrapAsync(boundUnlikePost)
  );

  // Comment routes using wrapAsync
  // Pass authService to authenticate middleware factory
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.get('/:id/comments', wrapAsync(boundGetComments));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post(
    '/:id/comments',
    authenticate(authService),
    wrapAsync(boundCreateComment)
  );

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.delete(
    '/comments/:id',
    authenticate(authService),
    wrapAsync(boundDeleteComment)
  );

  return router;
}
