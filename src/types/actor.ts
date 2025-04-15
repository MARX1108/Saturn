export interface Actor {
  _id?: any;
  id: string;
  type: string;
  preferredUsername: string;
  username?: string;
  name: string;
  displayName?: string;
  summary: string;
  bio?: string;
  inbox: string;
  outbox: string;
  following: string;
  followers: string;
  publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
  privateKey?: string;
  icon?: {
    type?: string;
    mediaType?: string;
    url: string;
  };
  avatarUrl?: string;
  createdAt?: Date;
  password?: string;
  email?: string;
  '@context'?: string | string[];
}
