// Auth models for the auth module
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

export interface LoginResponse {
  actor: {
    id: string;
    preferredUsername: string;
    name?: string;
    bio?: string;
    icon?: {
      type: string;
      url: string;
      mediaType?: string;
    };
  };
  token: string;
}

export interface AuthenticatedUser {
  id: string;
  preferredUsername: string;
  name?: string;
  bio?: string;
}
