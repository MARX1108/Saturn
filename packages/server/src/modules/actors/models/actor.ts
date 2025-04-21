import { ObjectId } from 'mongodb';

export interface ActorPublicKey {
  id: string; // URL for the key itself
  owner: string; // URL of the actor this key belongs to
  publicKeyPem: string;
}

export interface ActorIcon {
  type: 'Image';
  mediaType: string;
  url: string;
}

// Canonical Actor definition representing the data stored in the database
// and used within the server application logic.
// Corresponds to ActivityPub 'Person' type.
export interface Actor {
  _id: ObjectId; // Internal MongoDB identifier
  id: string; // ActivityPub ID (URL, unique across the fediverse)
  type: 'Person'; // ActivityPub type
  username: string; // Fully qualified username (e.g., user@example.com)
  preferredUsername: string; // Local username (e.g., user), maps to AP preferredUsername
  email?: string; // User's email address for notifications/recovery (optional for remote actors)
  password?: string; // Hashed password, internal use only, select: false in repo
  name?: string; // Alias for displayName, common in AP contexts
  displayName?: string; // User's display name
  summary?: string; // User's biography or profile description, maps to AP summary
  inbox: string; // URL of the actor's ActivityPub inbox
  outbox: string; // URL of the actor's ActivityPub outbox
  followers: string; // URL to the collection of followers
  following?: string[]; // Array of ActivityPub IDs (URLs) the actor is following (optional)
  publicKey?: ActorPublicKey; // Actor's public key for verifying signatures
  privateKey?: string; // Actor's private key (PEM format), server-side only, handle securely
  icon?: ActorIcon; // Profile picture details, maps to AP icon
  isAdmin?: boolean; // Flag for administrative privileges (internal use)
  isVerified?: boolean; // Flag indicating if the account is verified (internal use)
  createdAt: Date; // Timestamp of document creation
  updatedAt: Date; // Timestamp of last document update
  lastFetchedAt?: Date; // Timestamp of last fetch for remote actors
  isRemote?: boolean; // Flag indicating if this is a remote actor representation
  host?: string; // Host domain of the actor if remote
  manuallyApprovesFollowers?: boolean; // AP property
  discoverable?: boolean; // AP property
  movedTo?: string; // AP property (URL of new actor)
  alsoKnownAs?: string[]; // AP property (URLs)
  featured?: string; // AP property (URL of featured collection)
  endpoints?: {
    // AP property
    sharedInbox?: string; // URL of shared inbox
  };
  // Add other relevant ActivityPub Person properties as needed
  // '@context' is often handled dynamically during serialization
}

// Note: CreateActorRequest and ActorResponse interfaces removed.
// They should be defined closer to their usage (e.g., DTOs in controllers or specific types in services).
