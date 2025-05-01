import { Router } from 'express';
import { ServiceContainer } from '../../../utils/container';
import { CommentsController as _CommentsController } from '../controllers/comments.controller';
import { authenticate } from '../../../middleware/auth';
import { Request, Response, NextFunction } from 'express';
import { wrapAsync } from '../../../utils/routeHandler';
import {
  validateRequestParams,
  validateRequestQuery,
} from '../../../middleware/validateRequest';
import {
  commentIdParamSchema,
  commentsQuerySchema,
  postIdParamSchema,
} from '../schemas/comments.schemas';

/**
 * Configure comment routes with the controller
 */
export default function configureCommentRoutes(
  container: ServiceContainer
): Router {
  const router = Router();
  const commentsController = container.commentsController;

  // Public routes
  router.get(
    '/:postId',
    validateRequestParams(postIdParamSchema),
    validateRequestQuery(commentsQuerySchema),
    wrapAsync((req: Request, res: Response) =>
      commentsController.getComments(req, res)
    )
  );

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
    validateRequestParams(commentIdParamSchema),
    wrapAsync((req: Request, res: Response) =>
      commentsController.deleteComment(req, res)
    )
  );

  return router;
}
