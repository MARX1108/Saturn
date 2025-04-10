/**
 * API Error response structure
 */
export interface ApiError {
  status: number;
  message: string;
  data: any | null;
}

/**
 * Authentication related types
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  displayName?: string;
  bio?: string;
}

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
}

export interface AuthResponse {
  actor: User;
  token: string;
}

export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;
export type MeResponse = User;
