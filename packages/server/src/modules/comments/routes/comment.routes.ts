/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { ServiceContainer } from '../../../utils/container';
import { CommentsController } from '../controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { wrapAsync } from '../../../utils/routeHandler';

/**
 * Configure comment routes with the controller
 */
export default function configureCommentRoutes(
  container: ServiceContainer
): Router {
  const router = Router();
  const commentsController = container.commentsController;

  // Public routes
  router.get('/:postId', (req, res, next): void => {
    void commentsController.getComments(req, res).catch(next);
  });

  // Protected routes

  router.post(
    '/',
    authenticate(container.authService),
    wrapAsync((req: Request, res: Response, next: NextFunction) =>
      commentsController.createComment(req, res, next)
    )
  );

  router.delete(
    '/:commentId',
    authenticate(container.authService),
    wrapAsync((req, res, next) => commentsController.deleteComment(req, res))
  );

  return router;
}
