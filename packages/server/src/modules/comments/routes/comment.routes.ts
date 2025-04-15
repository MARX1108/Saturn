import express, { Router, RequestHandler } from 'express';
import { CommentsController } from '../controllers/comments.controller';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

/**
 * Configure comment routes with the controller
 */
export function configureCommentRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { commentService } = serviceContainer;

  // Create controller with injected dependencies
  const commentsController = new CommentsController(commentService);

  // Delete a comment by ID (requires authentication)
  const deleteCommentByIdHandler: RequestHandler = (req, res, next) => {
    commentsController.deleteCommentById(req as any, res, next);
  };
  router.delete('/:commentId', auth as any, deleteCommentByIdHandler);

  return router;
}
