// User model types for authentication
export interface DbUser {
  _id?: string;
  id?: string;
  preferredUsername?: string;
  username?: string;
  [key: string]: any; // Allow for additional properties
}
