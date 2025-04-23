import {
  Notification,
  CreateNotificationDto,
  FormattedNotification,
  NotificationType,
} from '../models/notification';
import { NotificationRepository } from '@/modules/notifications/repositories/notification.repository';
import { ActorService } from '@/modules/actors/services/actorService';
import { AppError, ErrorType } from '../../../utils/errors';
import {
  Db,
  ObjectId,
  Filter,
  UpdateFilter,
  UpdateResult,
  DeleteResult,
  Collection,
  OptionalUnlessRequiredId,
} from 'mongodb';
import { PostService } from '@/modules/posts/services/postService';
import { CommentService } from '@/modules/comments/services/comment.service';
import { Actor } from '@/modules/actors/models/actor';

// Define a simple logger interface or import a proper logger
type Logger = object;

export class NotificationService {
  private notificationRepository?: NotificationRepository;
  private db: Db;
  private actorService: ActorService;
  private postService!: PostService; // Mark for definite assignment
  private commentService!: CommentService; // Mark for definite assignment

  constructor(
    db: Db,
    actorService: ActorService
    // Remove PostService, CommentService from constructor
  ) {
    this.db = db;
    this.actorService = actorService;
    // Services will be injected via setters
  }

  // Setter for PostService
  public setPostService(postService: PostService): void {
    this.postService = postService;
  }

  // Setter for CommentService
  public setCommentService(commentService: CommentService): void {
    this.commentService = commentService;
  }

  // Keep existing setActorService if it's used elsewhere, though not for the cycle
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
      return null;
    }

    const now = new Date();
    // Manually construct notification data to ensure correct types and avoid overwrites
    const notificationData: OptionalUnlessRequiredId<Notification> = {
      recipientUserId: data.recipientUserId, // Already string in DTO
      type: data.type, // Enum value
      read: data.read ?? false, // Use provided value or default to false
      createdAt: now,
      updatedAt: now, // Add required updatedAt
    };

    // Add optional fields if they exist in the DTO and convert IDs if necessary
    if (data.actorUserId) {
      // Assume actorUserId in DTO is string as per model
      notificationData.actorUserId = data.actorUserId;
    }
    if (data.postId) {
      // Assume postId in DTO is string as per model
      notificationData.postId = data.postId;
    }
    if (data.commentId) {
      // Assume commentId in DTO is string as per model
      notificationData.commentId = data.commentId;
    }
    // if (data.content) { // Content is not part of the base Notification model
    //   notificationData.content = data.content;
    // }

    // Explicitly exclude spreading ...data to prevent type mismatches/overwrites

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
  ): Promise<UpdateResult | { acknowledged: boolean; modifiedCount: number }> {
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
    // updateMany not in base repository, use collection method directly
    const result = await this.collection.updateMany(filter, {
      $set: { read: true, updatedAt: new Date() },
    });
    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
    };
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
        // Manually construct FormattedNotification
        const formatted: Partial<FormattedNotification> = {
          id:
            notification._id instanceof ObjectId
              ? notification._id.toHexString()
              : notification._id!,
          recipientUserId: notification.recipientUserId,
          type: notification.type,
          postId: notification.postId,
          commentId: notification.commentId,
          read: notification.read,
          createdAt: notification.createdAt,
          updatedAt: notification.updatedAt, // Add required updatedAt
          // content: notification.content, // Add if content exists on base Notification
        };

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

        formattedNotifications.push(formatted as FormattedNotification);
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
    let actor: Actor | null = null;
    if (notification.actorUserId) {
      try {
        // Use findById which expects string | ObjectId
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
      : undefined;

    // Construct the FormattedNotification object with all required fields
    const formattedResult: FormattedNotification = {
      id:
        notification._id instanceof ObjectId
          ? notification._id.toHexString()
          : notification._id!,
      recipientUserId: notification.recipientUserId,
      type: notification.type,
      actor: formattedActor,
      postId: notification.postId,
      commentId: notification.commentId,
      read: notification.read,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt, // Add required updatedAt
      // content: notification.content, // Add if content exists on base Notification
    };

    return formattedResult;
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

  // Need access to the collection for updateMany
  private get collection(): Collection<Notification> {
    return this.db.collection<Notification>('notifications');
  }
}
