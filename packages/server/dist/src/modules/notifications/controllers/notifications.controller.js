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
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      const notifications = await this.notificationService.getNotifications(
        req.user.id
      );
      return res.json(notifications);
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
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      const { id } = req.params;
      await this.notificationService.markRead(id, req.user.id);
      return res.status(204).end();
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
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      await this.notificationService.markAllRead(req.user.id);
      return res.status(204).end();
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
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      const count = await this.notificationService.getUnreadCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}
exports.NotificationsController = NotificationsController;
