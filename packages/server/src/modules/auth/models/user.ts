// User model types for authentication
export interface DbUser {
  _id: string;
  id: string;
  username: string;
  preferredUsername: string;
  password: string;
  followers: string[];
  following: string[];
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
