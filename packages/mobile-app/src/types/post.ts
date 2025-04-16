/**
 * Post Interface
 * Defines the structure of post data in the application
 * Aligned with the backend API model
 */
export interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    username: string; // Maps to preferredUsername in User type
    displayName: string;
    avatarUrl: string;
  };
  attachments?: Array<{
    url: string;
    type: string;
    mediaType: string;
  }>;
  createdAt: string;
  sensitive: boolean;
  contentWarning: string;
  likes: number;
  likedBy: string[]; // Array of user IDs who liked the post
  likedByUser: boolean; // Client-side computed field
  shares: number;
}

/**
 * Comment Interface
 * Defines the structure of comment data for posts
 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;

  // For frontend display purposes (populated after fetching)
  author?: {
    preferredUsername: string;
    name?: string;
    icon?: {
      url: string;
      mediaType: string;
    };
  };
}

/**
 * CreatePostData
 * Fields required for creating a new post
 */
export interface CreatePostData {
  content: string;
  sensitive?: boolean;
  contentWarning?: string;
  attachments?: File[];
}
