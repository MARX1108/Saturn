import { Router } from 'express';
import { ServiceContainer } from '../../../utils/container';
import { CommentsController } from '../controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { Request, Response, NextFunction } from 'express';

/**
 * Configure comment routes with the controller
 */
export default function configureCommentRoutes(
  container: ServiceContainer
): Router {
  const router = Router();
  const commentsController = container.commentsController;

  // Public routes
  router.get('/:postId', (req, res, next) => {
    void commentsController.getComments(req, res).catch(next);
  });

  // Protected routes
  router.post(
    '/',
    authenticate(container.authService),
    (req: Request, res: Response, next: NextFunction) => {
      void commentsController.createComment(req, res, next).catch(next);
    }
  );

  router.delete(
    '/:commentId',
    authenticate(container.authService),
    (req, res, next) => {
      void commentsController.deleteComment(req, res).catch(next);
    }
  );

  return router;
}
