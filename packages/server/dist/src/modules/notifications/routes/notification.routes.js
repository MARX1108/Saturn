'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureNotificationRoutes = configureNotificationRoutes;
const express_1 = __importDefault(require('express'));
const notifications_controller_1 = require('../controllers/notifications.controller');
const auth_1 = require('../../../middleware/auth');
const routeHandler_1 = require('../../../utils/routeHandler');
const validateRequest_1 = require('../../../middleware/validateRequest');
const notification_schemas_1 = require('../schemas/notification.schemas');
/**
 * Configure notification routes with the controller
 */
function configureNotificationRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { notificationService, authService } = serviceContainer;
  if (!authService) {
    throw new Error(
      'AuthService not found in service container during notification route setup'
    );
  }
  // Create controller with injected dependencies
  const notificationsController =
    new notifications_controller_1.NotificationsController(notificationService);
  // Get notifications for authenticated user
  const getNotifications = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.getNotifications(req, res, next)
  );
  router.get(
    '/',
    (0, auth_1.authenticate)(authService),
    (0, validateRequest_1.validateRequestQuery)(
      notification_schemas_1.routeNotificationsQuerySchema
    ),
    getNotifications
  );
  // Mark specific notifications as read
  const markRead = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.markRead(req, res, next)
  );
  // Custom middleware to handle authentication first
  const validateMarkRead = (req, res, next) => {
    // Check for authorization header first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    // If auth header exists, proceed to validation
    return (0, validateRequest_1.validateRequestBody)(
      notification_schemas_1.markReadSchema
    )(req, res, next);
  };
  router.post(
    '/mark-read',
    validateMarkRead,
    (0, auth_1.authenticate)(authService),
    markRead
  );
  // Mark all notifications as read
  const markAllRead = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.markAllRead(req, res, next)
  );
  router.post(
    '/mark-all-read',
    (0, auth_1.authenticate)(authService),
    markAllRead
  );
  // Get unread notification count
  const getUnreadCount = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.getUnreadCount(req, res, next)
  );
  router.get(
    '/unread-count',
    (0, auth_1.authenticate)(authService),
    getUnreadCount
  );
  return router;
}
