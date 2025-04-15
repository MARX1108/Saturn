// Post models for the posts module
export interface Post {
  _id?: string;
  id: string;
  authorId: string;
  content: string;
  visibility: 'public' | 'private';
  published: Date;
  updated: Date;
  type: 'Note';
  to: string[];
  cc: string[];
  attributedTo: string;
  url: string;
  replies: string[];
  likes: string[];
  shares: number;
  sensitive?: boolean;
  contentWarning?: string;
  actor: {
    id: string;
    username: string;
  };
  attachments?: Attachment[];
}

export interface Attachment {
  url: string;
  type: 'Image' | 'Video' | 'Document';
  mediaType: string;
}

export interface CreatePostRequest {
  content: string;
  username: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: Attachment[];
}

export interface UpdatePostRequest {
  content?: string;
  sensitive?: boolean;
  contentWarning?: string;
}

export interface PostResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  attachments?: Attachment[];
  createdAt: string;
  sensitive?: boolean;
  contentWarning?: string;
  likes: number;
  likedByUser: boolean;
  shares: number;
}
