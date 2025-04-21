import {
  Notification,
  CreateNotificationDto,
  FormattedNotification,
  NotificationType,
} from '../models/notification';
import { NotificationRepository } from '@/modules/notifications/repositories/notificationRepository';
import { ActorService } from '@/modules/actors/services/actorService';
import { AppError, ErrorType } from '../../../utils/errors';
import {
  Db,
  ObjectId,
  Filter,
  UpdateFilter,
  UpdateResult,
  DeleteResult,
} from 'mongodb';
import { PostService } from '@/modules/posts/services/postService';
import { CommentService } from '@/modules/comments/services/comment.service';

export class NotificationService {
  private notificationRepository?: NotificationRepository;
  private db: Db;
  private actorService: ActorService;
  private postService: PostService;
  private commentService: CommentService;

  constructor(
    db: Db,
    actorService: ActorService,
    postService: PostService,
    commentService: CommentService
  ) {
    this.db = db;
    this.actorService = actorService;
    this.postService = postService;
    this.commentService = commentService;
  }

  setActorService(actorService: ActorService) {
    this.actorService = actorService;
  }

  /**
   * Create a new notification
   * @param data - Notification data
   */
  async createNotification(
    data: CreateNotificationDto
  ): Promise<Notification | null> {
    // Prevent self-notification
    if (data.actorUserId && data.recipientUserId === data.actorUserId) {
      console.log('Skipping self-notification');
      // Optionally, throw an error or return null/undefined
      return null;
    }

    const now = new Date();
    // Ensure the data passed to repository.create matches OptionalId<Notification>
    const notificationData: OptionalUnlessRequiredId<Notification> = {
      recipientUserId:
        typeof data.recipientUserId === 'string'
          ? new ObjectId(data.recipientUserId)
          : data.recipientUserId,
      actorUserId: data.actorUserId
        ? typeof data.actorUserId === 'string'
          ? new ObjectId(data.actorUserId)
          : data.actorUserId
        : undefined,
      type: data.type,
      postId: data.postId
        ? typeof data.postId === 'string'
          ? new ObjectId(data.postId)
          : data.postId
        : undefined,
      commentId: data.commentId
        ? typeof data.commentId === 'string'
          ? new ObjectId(data.commentId)
          : data.commentId
        : undefined,
      read: false,
      createdAt: now,
      // Add other required fields with defaults if necessary
    };

    const createdNotification = await this.repository.create(notificationData);
    // TODO: Potentially push notification via WebSocket or other real-time mechanism
    return createdNotification;
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
    userId: string | ObjectId,
    notificationIds?: string[]
  ): Promise<UpdateResult> {
    const userObjectId =
      typeof userId === 'string' ? new ObjectId(userId) : userId;
    const filter: Filter<Notification> = {
      recipientUserId: userObjectId.toHexString(),
      read: false,
    };
    if (notificationIds && notificationIds.length > 0) {
      filter._id = {
        $in: notificationIds.map(id => new ObjectId(id)),
      };
    }
    // Assuming repository has updateMany or similar method
    // This might need adjustment based on actual NotificationRepository implementation
    return this.repository.updateMany(filter, {
      $set: { read: true, updatedAt: new Date() },
    });
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

        // Get actor details if actorUserId is present and actorService is available
        if (notification.actorUserId && this.actorService) {
          try {
            const actor = await this.actorService.getActorById(
              notification.actorUserId
            );
            if (actor) {
              // Make sure actor._id exists before using it
              if (actor._id) {
                formatted.actor = {
                  id: actor._id.toHexString(),
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
    const result = await this.repository.findByRecipient(userId, {
      limit: 50,
      offset: 0,
    });
    return result.notifications;
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

  // Find notifications for a user with pagination
  async findNotificationsByUserId(
    userId: string | ObjectId,
    pagination: { limit: number; offset: number },
    filter?: { read?: boolean }
  ): Promise<{ notifications: FormattedNotification[]; total: number }> {
    const userObjectId =
      typeof userId === 'string' ? new ObjectId(userId) : userId;
    const queryFilter: Filter<Notification> = {
      recipientUserId: userObjectId.toHexString(),
    };
    if (filter?.read !== undefined) {
      queryFilter.read = filter.read;
    }

    const notifications = await this.repository.find(queryFilter, {
      sort: { createdAt: -1 },
      skip: pagination.offset,
      limit: pagination.limit,
    });
    const total = await this.repository.countDocuments(queryFilter);

    // Format notifications concurrently
    const formattedNotifications = await Promise.all(
      notifications.map(async (notification: Notification) =>
        this.formatNotification(notification)
      )
    );

    return { notifications: formattedNotifications, total };
  }

  // Helper to format notification response
  private async formatNotification(
    notification: Notification
  ): Promise<FormattedNotification> {
    let actor = null;
    if (notification.actorUserId) {
      try {
        actor = await this.actorService.getActorById(notification.actorUserId);
      } catch (error) {
        console.warn(
          `Failed to fetch actor ${notification.actorUserId} for notification ${notification._id}:`,
          error
        );
      }
    }

    const formattedActor = actor
      ? {
          id: actor._id.toHexString(),
          username: actor.preferredUsername,
          displayName: actor.displayName || actor.name,
          avatarUrl: actor.icon?.url,
        }
      : null;

    const post = notification.postId?.toString();
    const comment = notification.commentId?.toString();

    return {
      id: notification._id!.toString(),
      type: notification.type,
      actor: formattedActor || undefined,
      postId: post || undefined,
      commentId: comment || undefined,
      read: notification.read,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  // Add missing base repository methods if not extending directly
  // e.g., updateMany, deleteMany
  private get repository(): NotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new NotificationRepository(this.db);
    }
    return this.notificationRepository;
  }

  // Helper for ObjectId conversion (if needed)
  // private toObjectId(id: string | ObjectId): ObjectId { ... }
}
