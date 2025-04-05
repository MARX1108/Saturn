// Actor module types
export interface CreateActorRequest {
  username: string;
  displayName?: string;
  bio?: string;
}

export interface UpdateActorRequest {
  displayName?: string;
  bio?: string;
}

export interface ActorIconInfo {
  url: string;
  mediaType: string;
}

export interface Actor {
  id: string;
  type: string;
  preferredUsername: string;
  name?: string;
  summary?: string;
  inbox: string;
  outbox: string;
  followers: string;
  following: string;
  icon?: ActorIconInfo;
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  createdAt: Date;
  updatedAt: Date;
}