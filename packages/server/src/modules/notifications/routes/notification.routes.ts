import express, { Router, RequestHandler } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

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
  const getNotificationsHandler: RequestHandler = (req, res, next) => {
    notificationsController.getNotifications(req as any, res, next);
  };
  router.get('/', auth as any, getNotificationsHandler);

  // Mark specific notifications as read
  const markReadHandler: RequestHandler = (req, res, next) => {
    notificationsController.markRead(req as any, res, next);
  };
  router.post('/mark-read', auth as any, markReadHandler);

  // Mark all notifications as read
  const markAllReadHandler: RequestHandler = (req, res, next) => {
    notificationsController.markAllRead(req as any, res, next);
  };
  router.post('/mark-all-read', auth as any, markAllReadHandler);

  // Get unread notification count
  const getUnreadCountHandler: RequestHandler = (req, res, next) => {
    notificationsController.getUnreadCount(req as any, res, next);
  };
  router.get('/unread-count', auth as any, getUnreadCountHandler);

  return router;
}
