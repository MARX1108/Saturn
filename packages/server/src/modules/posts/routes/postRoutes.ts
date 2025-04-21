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
  const router = Router();
  // Ensure all required services AND domain are retrieved
  const {
    postService,
    actorService,
    uploadService,
    commentsController,
    authService,
    domain,
  } = container;

  // Ensure PostsController gets all 4 arguments
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain // Ensure domain is passed
  );

  // Bind controller methods to ensure 'this' context is correct
  const boundGetFeed = postsController.getFeed.bind(postsController);
  const boundGetPostById = postsController.getPostById.bind(postsController);
  const boundGetPostsByUsername =
    postsController.getPostsByUsername.bind(postsController);
  const boundCreatePost = postsController.createPost.bind(postsController);
  const boundUpdatePost = postsController.updatePost.bind(postsController);
  const boundDeletePost = postsController.deletePost.bind(postsController);
  const boundLikePost = postsController.likePost.bind(postsController);
  const boundUnlikePost = postsController.unlikePost.bind(postsController);
  const boundGetComments =
    commentsController.getComments.bind(commentsController); // Bind comments controller too
  const boundCreateComment =
    commentsController.createComment.bind(commentsController);
  const boundDeleteComment =
    commentsController.deleteComment.bind(commentsController);

  // Public routes using asyncHandler
  router.get('/', authenticate(authService), asyncHandler(boundGetFeed));
  router.get('/:id', asyncHandler(boundGetPostById));
  router.get('/users/:username', asyncHandler(boundGetPostsByUsername));

  // Protected routes using asyncHandler
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
