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
/**
 * Configure notification routes with the controller
 */
function configureNotificationRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { notificationService } = serviceContainer;
  // Create controller with injected dependencies
  const notificationsController =
    new notifications_controller_1.NotificationsController(notificationService);
  // Get notifications for authenticated user
  const getNotifications = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.getNotifications(req, res, next)
  );
  router.get('/', auth_1.auth, getNotifications);
  // Mark specific notifications as read
  const markRead = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.markRead(req, res, next)
  );
  router.post('/mark-read', auth_1.auth, markRead);
  // Mark all notifications as read
  const markAllRead = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.markAllRead(req, res, next)
  );
  router.post('/mark-all-read', auth_1.auth, markAllRead);
  // Get unread notification count
  const getUnreadCount = (0, routeHandler_1.wrapAsync)((req, res, next) =>
    notificationsController.getUnreadCount(req, res, next)
  );
  router.get('/unread-count', auth_1.auth, getUnreadCount);
  return router;
}
