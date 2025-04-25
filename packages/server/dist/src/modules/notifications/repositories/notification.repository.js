'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotificationRepository = void 0;
const mongodb_1 = require('mongodb');
const baseRepository_1 = require('../../shared/repositories/baseRepository');
class NotificationRepository extends baseRepository_1.MongoRepository {
  constructor(db) {
    super(db, 'notifications');
    // Create indexes for common queries
    void this.collection.createIndex({ recipientUserId: 1, createdAt: -1 });
    void this.collection.createIndex({ recipientUserId: 1, read: 1 });
    void this.collection.createIndex({ type: 1 });
    void this.collection.createIndex({ postId: 1 });
  }
  /**
   * Find notifications for a specific recipient
   * @param recipientUserId - The ID of the user to find notifications for
   * @param options - Pagination options
   * @param read - Optional filter by read status
   */
  async findByRecipient(recipientUserId, options, read) {
    const { limit, offset } = options;
    // Build query filter
    const filter = { recipientUserId };
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
  async markAsRead(notificationIds, recipientUserId) {
    // Convert string IDs to ObjectIds
    const objectIds = notificationIds.map(id => new mongodb_1.ObjectId(id));
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
  async markAllAsRead(recipientUserId) {
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
  async getUnreadCount(recipientUserId) {
    return this.collection.countDocuments({
      recipientUserId: recipientUserId,
      read: false,
    });
  }
}
exports.NotificationRepository = NotificationRepository;
