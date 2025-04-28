import { ObjectId } from 'mongodb';
import { Actor } from '../../../modules/actors/models/actor'; // Import canonical Actor

// Definition for media attachments within a post
export interface Attachment {
  url: string; // URL of the media file
  type: 'Image' | 'Video' | 'Document' | 'Audio'; // Extendable type of media
  mediaType: string; // MIME type (e.g., 'image/jpeg', 'video/mp4')
  name?: string; // Optional filename
  width?: number; // Optional image/video width
  height?: number; // Optional image/video height
  blurhash?: string; // Optional blurhash for image previews
}

// Canonical Post definition representing the data stored in the database
// and used within the server application logic.
// Corresponds primarily to ActivityPub 'Note' type, but could be others.
export interface Post {
  _id: ObjectId; // Internal MongoDB identifier
  id: string; // ActivityPub ID (URL, unique across the fediverse)
  type: string; // ActivityPub type (common types include 'Note', 'Article', 'Question', 'Page')
  actorId: ObjectId; // Reference to the internal _id of the Actor who created the post
  content: string; // The main text content of the post (HTML or Markdown, depending on AP settings)
  summary?: string; // Optional summary or content warning, maps to AP summary
  visibility: 'public' | 'followers' | 'unlisted' | 'direct'; // Post visibility/audience (maps to AP to/cc)
  sensitive: boolean; // Flag for sensitive content (maps to AP sensitive, default: false)
  // contentWarning?: string; // Use summary field instead for AP compatibility
  attachments?: Attachment[]; // Array of media attachments (maps to AP attachment)
  published: Date; // Timestamp when the post was published (maps to AP published)
  createdAt: Date; // Timestamp of document creation in the database
  updatedAt: Date; // Timestamp of last document update (maps to AP updated)

  // ActivityPub specific fields (should be string URLs or IDs)
  attributedTo: string; // ActivityPub ID (URL) of the author (Actor.id)
  to: string[]; // ActivityPub 'to' audience (URLs/IDs)
  cc: string[]; // ActivityPub 'cc' audience (URLs/IDs)
  url: string; // Canonical ActivityPub URL for this post object
  inReplyTo?: string; // ActivityPub ID (URL) of the post being replied to
  tag?: { type: string; href: string; name: string }[]; // AP Tags (Mentions, Hashtags)

  // Internal tracking/denormalized counts & refs
  replyCount: number; // Count of direct replies to this post
  likesCount: number; // Count of likes/favorites
  sharesCount: number; // Count of shares/boosts/reblogs

  // References to actors who interacted (using internal ObjectId)
  likedBy: ObjectId[]; // Array of Actor _ids who liked this post
  sharedBy: ObjectId[]; // Array of Actor _ids who shared this post

  // Optional fields populated in some queries for convenience
  // Avoid embedding full actor unless necessary for specific use case
  actor?: Pick<
    Actor,
    'id' | 'username' | 'preferredUsername' | 'displayName' | 'icon'
  >;
}

// Note: CreatePostRequest and PostResponse interfaces removed.
// They should be defined closer to their usage (e.g., DTOs in controllers or specific types in services).
