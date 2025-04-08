// Auth module types
export interface RegisterRequest {
  username: string;
  password: string;
  displayName?: string;
  bio?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  actor: {
    id: string;
    type: string;
    preferredUsername: string;
    name?: string;
    summary?: string;
    inbox: string;
    outbox: string;
    followers: string;
    following: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}
