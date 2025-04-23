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
    void notificationsController.getNotifications(req, res, next);
  };
  router.get('/', auth, getNotificationsHandler);

  // Mark specific notifications as read
  const markReadHandler: RequestHandler = (req, res, next) => {
    void notificationsController.markRead(req, res, next);
  };
  router.post('/mark-read', auth, markReadHandler);

  // Mark all notifications as read
  const markAllReadHandler: RequestHandler = (req, res, next) => {
    void notificationsController.markAllRead(req, res, next);
  };
  router.post('/mark-all-read', auth, markAllReadHandler);

  // Get unread notification count
  const getUnreadCountHandler: RequestHandler = (req, res, next) => {
    void notificationsController.getUnreadCount(req, res, next);
  };
  router.get('/unread-count', auth, getUnreadCountHandler);

  return router;
}
