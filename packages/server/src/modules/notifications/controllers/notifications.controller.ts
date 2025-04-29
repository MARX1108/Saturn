import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { AppError, ErrorType } from '../../../utils/errors';

export class NotificationsController {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.AUTHENTICATION
        );
      }

      // Handle page parameter validation
      let page = 1;
      if (req.query.page) {
        if (!/^\d+$/.test(req.query.page as string)) {
          throw new AppError(
            'Invalid page parameter',
            400,
            ErrorType.VALIDATION
          );
        }
        page = parseInt(req.query.page as string, 10);
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
  async markRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.AUTHENTICATION
        );
      }

      const { ids } = req.body;

      // Validate the ids parameter
      if (!ids) {
        throw new AppError('Missing ids parameter', 400, ErrorType.VALIDATION);
      }

      if (!Array.isArray(ids)) {
        throw new AppError('Ids must be an array', 400, ErrorType.VALIDATION);
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
  async markAllRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.AUTHENTICATION
        );
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
  async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.AUTHENTICATION
        );
      }

      const count = await this.notificationService.getUnreadCount(req.user.id);
      return res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}
