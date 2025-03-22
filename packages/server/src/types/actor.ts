// src/types/actor.ts
export interface Actor {
  id: string; // URL to the actor's profile (e.g., https://yourdomain.com/users/username)
  type: "Person"; // For users, this is "Person" in ActivityPub
  preferredUsername: string;
  name?: string; // Display name
  summary?: string; // Bio
  inbox: string; // URL where this actor receives activities
  outbox: string; // URL where this actor publishes activities
  followers: string; // URL to followers collection
  following: string; // URL to following collection
  publicKey?: {
    // Used for verification of activities
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  icon?: {
    // Profile picture
    type: "Image";
    mediaType: string;
    url: string;
  };
}

export interface CreateActorRequest {
  username: string;
  displayName?: string;
  bio?: string;
  avatarFile?: File;
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
