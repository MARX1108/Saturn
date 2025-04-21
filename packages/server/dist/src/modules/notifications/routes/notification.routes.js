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
  const getNotificationsHandler = (req, res, next) => {
    notificationsController.getNotifications(req, res, next);
  };
  router.get('/', auth_1.auth, getNotificationsHandler);
  // Mark specific notifications as read
  const markReadHandler = (req, res, next) => {
    notificationsController.markRead(req, res, next);
  };
  router.post('/mark-read', auth_1.auth, markReadHandler);
  // Mark all notifications as read
  const markAllReadHandler = (req, res, next) => {
    notificationsController.markAllRead(req, res, next);
  };
  router.post('/mark-all-read', auth_1.auth, markAllReadHandler);
  // Get unread notification count
  const getUnreadCountHandler = (req, res, next) => {
    notificationsController.getUnreadCount(req, res, next);
  };
  router.get('/unread-count', auth_1.auth, getUnreadCountHandler);
  return router;
}
