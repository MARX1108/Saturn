import { Db, ObjectId, Filter } from 'mongodb';
import { MongoRepository } from '../../shared/repositories/baseRepository';
import { Notification } from '../models/notification';

export class NotificationRepository extends MongoRepository<Notification> {
  constructor(db: Db) {
    super(db, 'notifications');

    // Create indexes for common queries
    this.collection.createIndex({ recipientUserId: 1, createdAt: -1 });
    this.collection.createIndex({ recipientUserId: 1, read: 1 });
    this.collection.createIndex({ type: 1 });
    this.collection.createIndex({ postId: 1 });
  }

  /**
   * Create a new notification
   */
  async create(
    data: Omit<Notification, '_id' | 'createdAt' | 'read'>
  ): Promise<Notification> {
    const notification: Notification = {
      ...data,
      read: false,
      createdAt: new Date(),
    };

    const result = await this.collection.insertOne(notification);
    return {
      ...notification,
      _id: result.insertedId.toString(),
    };
  }

  /**
   * Find notifications for a specific recipient
   * @param recipientUserId - The ID of the user to find notifications for
   * @param options - Pagination options
   * @param read - Optional filter by read status
   */
  async findByRecipient(
    recipientUserId: string,
    options: { limit: number; offset: number },
    read?: boolean
  ): Promise<{ notifications: Notification[]; total: number }> {
    const { limit, offset } = options;

    // Build query filter
    const filter: Filter<Notification> = { recipientUserId };
    if (read !== undefined) {
      filter.read = read;
    }

    // Get notifications with pagination and sorting
    const notifications = await this.collection
      .find(filter)
      .sort({ createdAt: -1 }) // Newest first
      .skip(offset)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await this.collection.countDocuments(filter);

    return { notifications, total };
  }

  /**
   * Mark specific notifications as read
   * @param notificationIds - Array of notification IDs to mark as read
   * @param recipientUserId - User ID to ensure notifications belong to this user
   */
  async markAsRead(
    notificationIds: string[],
    recipientUserId: string
  ): Promise<{ modifiedCount: number }> {
    // Convert string IDs to ObjectIds
    const objectIds = notificationIds.map(id => new ObjectId(id));

    const result = await this.collection.updateMany(
      {
        _id: { $in: objectIds },
        recipientUserId: recipientUserId,
      },
      { $set: { read: true } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Mark all notifications for a user as read
   * @param recipientUserId - The user ID
   */
  async markAllAsRead(
    recipientUserId: string
  ): Promise<{ modifiedCount: number }> {
    const result = await this.collection.updateMany(
      {
        recipientUserId: recipientUserId,
        read: false,
      },
      { $set: { read: true } }
    );

    return { modifiedCount: result.modifiedCount };
  }

  /**
   * Get the count of unread notifications for a user
   * @param recipientUserId - The user ID
   */
  async getUnreadCount(recipientUserId: string): Promise<number> {
    return this.collection.countDocuments({
      recipientUserId: recipientUserId,
      read: false,
    });
  }
}
