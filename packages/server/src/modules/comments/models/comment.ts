import { ObjectId } from 'mongodb';

/**
 * Comment interface
 */
export interface Comment {
  _id?: string | ObjectId;
  actorId: ObjectId;
  postId: string;
  authorId: string;
  content: string;
  likesCount?: number;
  likedBy?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Data needed to create a comment
 */
export interface CreateCommentDto {
  postId: string;
  authorId: string;
  content: string;
}

/**
 * Comment data with author information
 */
export interface FormattedComment extends Comment {
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}
