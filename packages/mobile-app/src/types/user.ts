/**
 * User Interface
 * Defines the structure of user data in the application
 * Aligned with the backend API model
 */
export interface User {
  _id: string;
  preferredUsername: string;
  name: string;
  bio?: string;
  icon?: {
    url: string;
    mediaType: string;
  };
  summary?: string;
  following?: number;
  followers?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authentication Response
 * Structure returned after successful login/registration
 */
export interface AuthResponse {
  actor: User;
  token: string;
  expiresIn?: number;
}

/**
 * Login Credentials
 * Required fields for authentication
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Registration Data
 * Fields required for creating a new user account
 */
export interface RegistrationData {
  username: string;
  password: string;
  displayName?: string;
  bio?: string;
}
