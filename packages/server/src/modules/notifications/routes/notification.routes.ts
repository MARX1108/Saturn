import express, {
  Router,
  RequestHandler as _RequestHandler,
  Request as ExpressRequest,
  Response as _Response,
  NextFunction as _NextFunction,
} from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authenticate } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';
import {
  validateRequestQuery,
  validateRequestBody,
} from '../../../middleware/validateRequest';
import {
  routeNotificationsQuerySchema,
  markReadSchema,
} from '../schemas/notification.schemas';

/**
 * Configure notification routes with the controller
 */
export function configureNotificationRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { notificationService, authService } = serviceContainer;

  if (!authService) {
    throw new Error(
      'AuthService not found in service container during notification route setup'
    );
  }

  // Create controller with injected dependencies
  const notificationsController = new NotificationsController(
    notificationService
  );

  // Get notifications for authenticated user

  const getNotifications = wrapAsync((req, res, next) =>
    notificationsController.getNotifications(req as ExpressRequest, res, next)
  );
  router.get(
    '/',
    authenticate(authService),
    validateRequestQuery(routeNotificationsQuerySchema),
    getNotifications
  );

  // Mark specific notifications as read
  const markRead = wrapAsync((req, res, next) =>
    notificationsController.markRead(req as ExpressRequest, res, next)
  );

  // Custom middleware to handle authentication first
  const validateMarkRead = (req: ExpressRequest, res: any, next: any) => {
    // Check for authorization header first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }

    // If auth header exists, proceed to validation
    return validateRequestBody(markReadSchema)(req, res, next);
  };

  router.post(
    '/mark-read',
    validateMarkRead,
    authenticate(authService),
    markRead
  );

  // Mark all notifications as read

  const markAllRead = wrapAsync((req, res, next) =>
    notificationsController.markAllRead(req as ExpressRequest, res, next)
  );
  router.post('/mark-all-read', authenticate(authService), markAllRead);

  // Get unread notification count

  const getUnreadCount = wrapAsync((req, res, next) =>
    notificationsController.getUnreadCount(req as ExpressRequest, res, next)
  );
  router.get('/unread-count', authenticate(authService), getUnreadCount);

  return router;
}
