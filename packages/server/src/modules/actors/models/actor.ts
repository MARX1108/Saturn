// Actor models for the actors module
export interface Actor {
  _id?: string;
  id: string;
  type: "Person";
  preferredUsername: string;
  name?: string;
  summary?: string;
  inbox: string;
  outbox: string;
  followers: string;
  following?: string[];
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  privateKey?: string;
  icon?: {
    type: "Image";
    mediaType: string;
    url: string;
  };
  bio?: string;
  createdAt?: Date;
  password?: string;
  "@context"?: string[];
}

export interface CreateActorRequest {
  username: string;
  displayName?: string;
  bio?: string;
  avatarFile?: File;
  password?: string;
  icon?: {
    type: "Image";
    mediaType: string;
    url: string;
  };
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
