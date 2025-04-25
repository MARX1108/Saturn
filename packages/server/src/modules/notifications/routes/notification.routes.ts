/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, {
  Router,
  RequestHandler,
  Request as ExpressRequest,
  Response,
  NextFunction,
} from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';

/**
 * Configure notification routes with the controller
 */
export function configureNotificationRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { notificationService } = serviceContainer;

  // Create controller with injected dependencies
  const notificationsController = new NotificationsController(
    notificationService
  );

  // Get notifications for authenticated user

  const getNotifications = wrapAsync((req, res, next) =>
    notificationsController.getNotifications(req as ExpressRequest, res, next)
  );
  router.get('/', auth, getNotifications);

  // Mark specific notifications as read

  const markRead = wrapAsync((req, res, next) =>
    notificationsController.markRead(req as ExpressRequest, res, next)
  );
  router.post('/mark-read', auth, markRead);

  // Mark all notifications as read

  const markAllRead = wrapAsync((req, res, next) =>
    notificationsController.markAllRead(req as ExpressRequest, res, next)
  );
  router.post('/mark-all-read', auth, markAllRead);

  // Get unread notification count

  const getUnreadCount = wrapAsync((req, res, next) =>
    notificationsController.getUnreadCount(req as ExpressRequest, res, next)
  );
  router.get('/unread-count', auth, getUnreadCount);

  return router;
}
