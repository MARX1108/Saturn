import { Router } from 'express';
import { CommentsController } from '../controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { AuthService } from '../../auth/services/auth.service';

/**
 * Configure comment routes with the controller
 */
export default function configureCommentRoutes(
  commentsController: CommentsController,
  authService: AuthService
): Router {
  const router = Router();

  // Public routes
  router.get('/comments/:postId', (req, res) =>
    commentsController.getComments(req, res)
  );

  // Protected routes
  router.post('/comments', authenticate(authService), (req, res) =>
    commentsController.createComment(req, res)
  );
  router.delete('/comments/:id', authenticate(authService), (req, res) =>
    commentsController.deleteComment(req, res)
  );

  return router;
}
