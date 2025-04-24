/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Router, RequestHandler } from 'express';
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
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const getNotifications = wrapAsync((req, res, next) =>
    notificationsController.getNotifications(req, res, next)
  );
  router.get('/', auth, getNotifications);

  // Mark specific notifications as read
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const markRead = wrapAsync((req, res, next) =>
    notificationsController.markRead(req, res, next)
  );
  router.post('/mark-read', auth, markRead);

  // Mark all notifications as read
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const markAllRead = wrapAsync((req, res, next) =>
    notificationsController.markAllRead(req, res, next)
  );
  router.post('/mark-all-read', auth, markAllRead);

  // Get unread notification count
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const getUnreadCount = wrapAsync((req, res, next) =>
    notificationsController.getUnreadCount(req, res, next)
  );
  router.get('/unread-count', auth, getUnreadCount);

  return router;
}
