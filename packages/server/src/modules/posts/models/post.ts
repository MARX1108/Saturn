// Post models for the posts module
export interface Post {
  _id?: string;
  id: string;
  content: string;
  actor: {
    id: string;
    username: string;
  };
  attachments?: Attachment[];
  createdAt: Date;
  sensitive: boolean;
  contentWarning?: string;
  likes?: string[]; // Array of actor IDs who liked this post
  shares?: number;  // Count of shares/boosts
}

export interface Attachment {
  type: "Image" | "Video" | "Document" | string;
  url: string;
  mediaType: string;
  width?: number;
  height?: number;
  duration?: number;
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
  username?: string; 
  sensitive?: boolean;
  contentWarning?: string;
}

export interface PostResponse {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  attachments?: Attachment[];
  createdAt: string;
  sensitive: boolean;
  contentWarning?: string;
  likes: number;
  likedByUser: boolean;
  shares: number;
}