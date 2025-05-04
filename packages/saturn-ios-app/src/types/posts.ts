/**
 * Type definitions for posts
 */

export interface User {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  likes?: number;
  comments?: number;
  liked?: boolean;
}

export interface PostCreateInput {
  content: string;
}
