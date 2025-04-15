import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';
import { BadRequestError } from '../../../utils/errors';

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
      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const userId = req.user.id;

      // Parse pagination parameters
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      // Validate pagination params
      if (isNaN(limit) || limit < 1 || isNaN(offset) || offset < 0) {
        throw new BadRequestError('Invalid pagination parameters');
      }

      // Parse read filter if provided
      let readFilter: boolean | undefined = undefined;
      if (req.query.read !== undefined) {
        readFilter = req.query.read === 'true';
      }

      // Get notifications from service
      const result = await this.notificationService.getNotificationsForUser(
        userId,
        { limit, offset },
        readFilter
      );

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark specific notifications as read
   */
  async markRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const userId = req.user.id;

      // Get notification IDs from request body
      const { ids } = req.body;

      // Validate IDs array
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid notification IDs array is required');
      }

      // Mark notifications as read
      const success = await this.notificationService.markNotificationsAsRead(
        ids,
        userId
      );

      return res.status(success ? 200 : 204).json({ success });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark all notifications as read for the authenticated user
   */
  async markAllRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const userId = req.user.id;

      // Mark all notifications as read
      const success =
        await this.notificationService.markAllNotificationsAsRead(userId);

      return res.status(success ? 200 : 204).json({ success });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get count of unread notifications for the authenticated user
   */
  async getUnreadCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> {
    try {
      // Get user ID from authenticated user
      if (!req.user || !req.user.id) {
        throw new BadRequestError('User ID not found in request');
      }
      const userId = req.user.id;

      // Get unread count
      const count = await this.notificationService.getUnreadCount(userId);

      return res.status(200).json({ count });
    } catch (error) {
      next(error);
    }
  }
}
