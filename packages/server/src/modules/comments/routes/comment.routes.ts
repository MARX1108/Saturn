import { Router } from 'express';
import { ServiceContainer } from '../../../utils/container';
import { CommentsController } from '../controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';

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
    commentsController.getComments(req, res).catch(next);
  });

  // Protected routes
  router.post('/', authenticate(container.authService), (req, res, next) => {
    commentsController.createComment(req, res).catch(next);
  });

  router.delete(
    '/:commentId',
    authenticate(container.authService),
    (req, res, next) => {
      commentsController.deleteComment(req, res).catch(next);
    }
  );

  return router;
}
