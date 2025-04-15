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

      await this.notificationService.markAllRead(req.user.id);
      return res.status(204).end();
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
