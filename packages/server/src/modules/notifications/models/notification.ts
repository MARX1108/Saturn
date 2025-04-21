import { ObjectId } from 'mongodb';
import { Actor } from '@/modules/actors/models/actor';
import { Post } from '@/modules/posts/models/post';
import { Comment } from '@/modules/comments/models/comment';

/**
 * Notification types supported by the system
 */
export enum NotificationType {
  FOLLOW = 'follow',
  LIKE = 'like',
  COMMENT = 'comment',
  MENTION = 'mention',
  REPOST = 'repost',
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
  updatedAt: Date;
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
  read?: boolean;
}

/**
 * Formatted notification with actor and content details
 */
export interface FormattedNotification extends Notification {
  id: string;
  actor?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  // Additional content details could be added here if needed
}
