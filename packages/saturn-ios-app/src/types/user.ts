/**
 * User type definition for non-sensitive user data to be stored in state.
 * IMPORTANT: This should only contain non-sensitive fields.
 */
export interface User {
  _id: string;
  id: string; // Some APIs might use different ID field names
  username: string;
  preferredUsername?: string;
  displayName?: string;
  avatarUrl?: string; // URL to user's avatar image
  bio?: string; // User's bio or description
  followersCount?: number; // Number of followers
  followingCount?: number; // Number of users being followed
  // Add other non-sensitive fields as needed
  // IMPORTANT: DO NOT include email, password, or any sensitive data here
}
