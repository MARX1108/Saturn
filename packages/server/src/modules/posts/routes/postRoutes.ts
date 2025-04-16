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
  router.get(
    '/',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.getFeed(req, res, next).catch(next);
    }
  );

  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    postsController.getPostById(req, res, next).catch(next);
  });

  router.get(
    '/users/:username',
    (req: Request, res: Response, next: NextFunction) => {
      postsController.getPostsByUsername(req, res, next).catch(next);
    }
  );

  // Protected routes
  router.post(
    '/',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.createPost(req, res, next).catch(next);
    }
  );

  router.put(
    '/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.updatePost(req, res, next).catch(next);
    }
  );

  router.delete(
    '/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.deletePost(req, res).catch(next);
    }
  );

  router.post(
    '/:id/like',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.likePost(req, res).catch(next);
    }
  );

  router.delete(
    '/:id/like',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      postsController.unlikePost(req, res).catch(next);
    }
  );

  // Comment routes
  router.get(
    '/:id/comments',
    (req: Request, res: Response, next: NextFunction) => {
      commentsController.getComments(req, res).catch(next);
    }
  );

  router.post(
    '/:id/comments',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      commentsController.createComment(req, res).catch(next);
    }
  );

  router.delete(
    '/comments/:id',
    authenticate(authService),
    (req: Request, res: Response, next: NextFunction) => {
      commentsController.deleteComment(req, res).catch(next);
    }
  );

  return router;
}
