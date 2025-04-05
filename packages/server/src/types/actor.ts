// src/types/actor.ts
export interface Actor {
  _id?: string; // Add optional _id field for database purposes
  id: string; // URL to the actor's profile (e.g., https://yourdomain.com/users/username)
  type: "Person"; // For users, this is "Person" in ActivityPub
  preferredUsername: string;
  name?: string; // Display name
  summary?: string; // Bio
  inbox: string; // URL where this actor receives activities
  outbox: string; // URL where this actor publishes activities
  followers: string; // URL to followers collection
  following?: string[]; // Ensure `following` is defined as an array of strings
  publicKey?: {
    // Used for verification of activities
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  privateKey?: string; // Add privateKey field for actor's private key
  icon?: {
    // Profile picture
    type: "Image";
    mediaType: string;
    url: string;
  };
  bio?: string; // Add bio field for actor's biography
  createdAt?: Date; // Add createdAt field for actor's creation timestamp
  password?: string; // Add password field for actor's hashed password
  "@context"?: string[]; // Add @context property for ActivityPub compliance
}

export interface CreateActorRequest {
  username: string;
  displayName?: string;
  bio?: string;
  avatarFile?: File;
  password?: string; // Add password field for authentication
  icon?: {
    type: "Image";
    mediaType: string;
    url: string;
  }; // Add icon field for profile picture
}

export interface ActorResponse {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  followersCount: number;
  followingCount: number;
}
