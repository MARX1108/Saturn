import { ObjectId } from "mongodb";

export interface Attachment {
  url: string;
  type: string;
  mediaType: string;
}

export interface Post {
  _id?: ObjectId;
  id?: string; // ActivityPub ID
  content: string;
  actorId: ObjectId;
  createdAt: Date;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: Attachment[];
  likes: number;
  replies: number;
  reposts: number;
  type?: string; // ActivityPub type
  attributedTo?: string; // ActivityPub attributedTo
}

export interface CreatePostRequest {
  content: string;
  username: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: Attachment[];
}

export interface PostResponse {
  id: string;
  content: string;
  author: {
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: Attachment[];
  likeCount: number;
  replyCount: number;
  repostCount: number;
  liked?: boolean;
  reposted?: boolean;
}
