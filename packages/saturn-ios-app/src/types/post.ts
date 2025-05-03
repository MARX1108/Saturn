import { User } from './user'; // Import User type for author info

export interface PostAttachment {
  id: string;
  url: string;
  type: 'image' | 'video' | 'unknown'; // Example types
}

export interface Post {
  _id: string; // Server-side ID
  id: string; // Client-side ID (might be the same)
  author: User; // Embed non-sensitive author info
  content: string;
  attachments?: PostAttachment[]; // Optional attachments
  createdAt: string; // Or Date object
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean; // Placeholder for user's like status
  // Add other relevant fields: visibility, tags, etc.
}

// Optional: Define type for API response if it wraps posts
// export interface PostsApiResponse {
//     posts: Post[];
//     hasMore?: boolean;
//     nextCursor?: string;
// }
