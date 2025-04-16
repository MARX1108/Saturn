import {
  Notification,
  CreateNotificationDto,
  FormattedNotification,
  NotificationType,
} from '../models/notification';
import { NotificationRepository } from '../repositories/notification.repository';
import { ActorService } from '../../actors/services/actorService';
import { AppError, ErrorType } from '../../../utils/errors';

export class NotificationService {
  private repository: NotificationRepository;
  private actorService: ActorService;

  constructor(repository: NotificationRepository, actorService: ActorService) {
    this.repository = repository;
    this.actorService = actorService;
  }

  /**
   * Create a new notification
   * @param data - Notification data
   */
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    // Validate required fields
    if (!data.recipientUserId) {
      throw new AppError(
        'Recipient user ID is required',
        400,
        ErrorType.VALIDATION
      );
    }

    if (!data.type || !Object.values(NotificationType).includes(data.type)) {
      throw new AppError(
        'Valid notification type is required',
        400,
        ErrorType.VALIDATION
      );
    }

    // Don't create notification if actor is the same as recipient
    if (data.actorUserId && data.actorUserId === data.recipientUserId) {
      // Self-notifications are not created
      const mockNotification: Notification = {
        recipientUserId: data.recipientUserId,
        actorUserId: data.actorUserId,
        type: data.type,
        postId: data.postId,
        commentId: data.commentId,
        read: true,
        createdAt: new Date(),
      };
      return mockNotification;
    }

    // Create the notification
    return this.repository.create(data);
  }

  /**
   * Get notifications for a user
   * @param recipientUserId - User ID
   * @param paginationOptions - Pagination options
   * @param readFilter - Optional filter by read status
   */
  async getNotificationsForUser(
    recipientUserId: string,
    paginationOptions: { limit: number; offset: number },
    readFilter?: boolean
  ): Promise<{
    notifications: FormattedNotification[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Get notifications from repository
    const { notifications, total } = await this.repository.findByRecipient(
      recipientUserId,
      paginationOptions,
      readFilter
    );

    // Format notifications with actor details
    const formattedNotifications =
      await this.formatNotifications(notifications);

    return {
      notifications: formattedNotifications,
      total,
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
    };
  }

  /**
   * Mark specific notifications as read
   * @param notificationIds - Array of notification IDs
   * @param recipientUserId - User ID (for security, to ensure notifications belong to this user)
   */
  async markNotificationsAsRead(
    notificationIds: string[],
    recipientUserId: string
  ): Promise<boolean> {
    if (!notificationIds.length) {
      return false;
    }

    const { modifiedCount } = await this.repository.markAsRead(
      notificationIds,
      recipientUserId
    );

    return modifiedCount > 0;
  }

  /**
   * Mark all notifications for a user as read
   * @param recipientUserId - User ID
   */
  async markAllNotificationsAsRead(recipientUserId: string): Promise<boolean> {
    const { modifiedCount } =
      await this.repository.markAllAsRead(recipientUserId);
    return modifiedCount > 0;
  }

  /**
   * Get count of unread notifications for a user
   * @param recipientUserId - User ID
   */
  async getUnreadNotificationCount(recipientUserId: string): Promise<number> {
    return this.repository.getUnreadCount(recipientUserId);
  }

  /**
   * Helper method to format notifications with actor details
   * @param notifications - Raw notifications from database
   */
  private async formatNotifications(
    notifications: Notification[]
  ): Promise<FormattedNotification[]> {
    const formattedNotifications: FormattedNotification[] = [];

    // Process notifications in parallel
    await Promise.all(
      notifications.map(async notification => {
        const formatted: FormattedNotification = { ...notification };

        // Get actor details if actorUserId is present
        if (notification.actorUserId) {
          try {
            const actor = await this.actorService.getActorById(
              notification.actorUserId
            );
            if (actor) {
              // Make sure actor._id exists before using it
              if (actor._id) {
                formatted.actor = {
                  id: actor._id,
                  username: actor.preferredUsername,
                  displayName: actor.name,
                  avatarUrl: actor.icon?.url,
                };
              } else {
                console.error('Actor found but actor._id is undefined');
              }
            }
          } catch (error) {
            console.error('Error fetching actor for notification:', error);
            // Continue without actor details rather than failing the entire request
          }
        }

        formattedNotifications.push(formatted);
      })
    );

    // Sort by createdAt descending (newest first)
    formattedNotifications.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return formattedNotifications;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.repository.findByRecipient(userId, { limit: 50, offset: 0 });
  }

  async markRead(id: string, userId: string): Promise<void> {
    await this.repository.markAsRead([id], userId);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
  }

  async getUnreadCount(recipientUserId: string): Promise<number> {
    return this.repository.getUnreadCount(recipientUserId);
  }
}
