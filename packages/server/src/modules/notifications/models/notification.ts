import { ObjectId } from 'mongodb';

/**
 * Notification types supported by the system
 */
export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  MENTION = 'mention',
  REPLY = 'reply',
}

/**
 * Notification interface
 */
export interface Notification {
  _id?: string | ObjectId;
  recipientUserId: string;
  actorUserId?: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
  read: boolean;
  createdAt: Date;
}

/**
 * Data needed to create a notification
 */
export interface CreateNotificationDto {
  recipientUserId: string;
  actorUserId?: string;
  type: NotificationType;
  postId?: string;
  commentId?: string;
}

/**
 * Formatted notification with actor and content details
 */
export interface FormattedNotification extends Notification {
  actor?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  // Additional content details could be added here if needed
}
