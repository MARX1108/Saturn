import { Router, Request, Response, NextFunction } from 'express';
import { PostsController } from '../controllers/postsController';
import { CommentsController } from '../../comments/controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Configure post routes with the controller
 */
export default function configurePostRoutes(
  postsController: PostsController,
  commentsController: CommentsController,
  authService: AuthService
): Router {
  const router = Router();

  // Public routes
  router.get('/posts', (req: Request, res: Response, next: NextFunction) =>
    postsController.getFeed(req, res, next)
  );
  router.get('/posts/:id', (req: Request, res: Response, next: NextFunction) =>
    postsController.getPostById(req, res, next)
  );
  router.get(
    '/users/:username/posts',
    (req: Request, res: Response, next: NextFunction) =>
      postsController.getPostsByUsername(req, res, next)
  );

  // Protected routes
  router.post(
    '/posts',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      postsController.createPost(req, res, next)
  );
  router.put(
    '/posts/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      postsController.updatePost(req, res, next)
  );
  router.delete(
    '/posts/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      postsController.deletePost(req, res, next)
  );
  router.post(
    '/posts/:id/like',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      postsController.likePost(req, res, next)
  );
  router.delete(
    '/posts/:id/like',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      postsController.unlikePost(req, res, next)
  );

  // Comment routes
  router.get(
    '/posts/:id/comments',
    (req: Request, res: Response, next: NextFunction) =>
      commentsController.getComments(req, res, next)
  );
  router.post(
    '/posts/:id/comments',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      commentsController.createComment(req, res, next)
  );
  router.delete(
    '/comments/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) =>
      commentsController.deleteComment(req, res, next)
  );

  return router;
}
