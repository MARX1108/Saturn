'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationsController = void 0;
const errors_1 = require('../../../utils/errors');
class NotificationsController {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      // Handle page parameter validation
      let page = 1;
      if (req.query.page) {
        if (!/^\d+$/.test(req.query.page)) {
          throw new errors_1.AppError(
            'Invalid page parameter',
            400,
            errors_1.ErrorType.VALIDATION
          );
        }
        page = parseInt(req.query.page, 10);
      }
      const limit = 10;
      const offset = (page - 1) * limit;
      const result = await this.notificationService.getNotificationsForUser(
        req.user.id,
        { limit, offset }
      );
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Mark notifications as read
   */
  async markRead(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const { ids } = req.body;
      // Validate the ids parameter
      if (!ids) {
        throw new errors_1.AppError(
          'Missing ids parameter',
          400,
          errors_1.ErrorType.VALIDATION
        );
      }
      if (!Array.isArray(ids)) {
        throw new errors_1.AppError(
          'Ids must be an array',
          400,
          errors_1.ErrorType.VALIDATION
        );
      }
      await this.notificationService.markNotificationsAsRead(ids, req.user.id);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Mark all notifications as read
   */
  async markAllRead(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      await this.notificationService.markAllNotificationsAsRead(req.user.id);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get unread notification count
   */
  async getUnreadCount(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const count = await this.notificationService.getUnreadCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}
exports.NotificationsController = NotificationsController;
