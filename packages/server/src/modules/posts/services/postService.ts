import { v4 as uuidv4 } from 'uuid';
import { Post, Attachment } from '@/modules/posts/models/post';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { AppError, ErrorType } from '@/utils/errors';
import { ObjectId } from 'mongodb';
import { Actor } from '@/modules/actors/models/actor';

// Define DTOs for service method parameters here
export interface CreatePostData {
  content: string;
  visibility?: 'public' | 'followers' | 'unlisted' | 'direct';
  sensitive?: boolean;
  summary?: string; // Use summary
  attachments?: Attachment[]; // Use Attachment type
  // Add actorId here as it's required to create a post
  actorId: string | ObjectId;
}

export interface UpdatePostData {
  content?: string;
  visibility?: 'public' | 'followers' | 'unlisted' | 'direct';
  sensitive?: boolean;
  summary?: string;
  attachments?: Attachment[]; // Use Attachment type
}

export class PostService {
  constructor(
    private postRepository: PostRepository,
    private actorService: ActorService,
    private notificationService: NotificationService,
    private domain: string
  ) {}

  // --- Create Post ---
  async createPost(data: CreatePostData): Promise<Post> {
    // Validate actorId
    const actorObjectId =
      typeof data.actorId === 'string'
        ? new ObjectId(data.actorId)
        : data.actorId;
    const actor = await this.actorService.getActorById(actorObjectId);
    if (!actor) {
      throw new AppError('Author not found', 404, ErrorType.NOT_FOUND);
    }

    const postId = uuidv4();
    const postUrl = `https://${this.domain}/posts/${postId}`;
    const now = new Date();

    const newPost: Omit<Post, '_id' | 'actor'> = {
      id: postUrl, // AP ID is the URL
      type: 'Note', // Default to Note
      actorId: actorObjectId,
      content: data.content,
      visibility: data.visibility || 'public', // Default visibility
      sensitive: data.sensitive || false,
      summary: data.summary,
      attachments: data.attachments || [],
      published: now,
      createdAt: now,
      updatedAt: now,
      attributedTo: actor.id, // Author's AP ID
      to: ['https://www.w3.org/ns/activitystreams#Public'], // Default audience (adjust based on visibility)
      cc: [],
      url: postUrl,
      replyCount: 0,
      likesCount: 0,
      sharesCount: 0,
      likedBy: [],
      sharedBy: [],
    };

    // Adjust to/cc based on visibility
    if (newPost.visibility === 'followers') {
      newPost.to = [actor.followers!]; // Send to followers collection
      newPost.cc = []; // Maybe add mentions later
    } else if (newPost.visibility === 'public') {
      newPost.to = ['https://www.w3.org/ns/activitystreams#Public'];
      newPost.cc = [actor.followers!]; // Also CC followers
    } else {
      // Handle 'direct' or 'unlisted' - requires specific recipients
      newPost.to = []; // Requires mentions or specific actor IDs
      newPost.cc = [];
    }

    // Use create method from base repository
    const createdPost = await this.postRepository.create({
      ...newPost,
      _id: new ObjectId(),
    } as Post); // Ensure _id is generated if not passed

    // TODO: Send notifications (e.g., to mentioned users)
    // TODO: Federate post via ActivityPub outbox

    return createdPost;
  }

  // --- Get Post By ID ---
  async getPostById(postId: string): Promise<Post | null> {
    // Assuming postId is the ActivityPub ID (URL)
    return this.postRepository.findOne({ id: postId });
  }

  // --- Get Feed ---
  async getFeed(options: {
    limit?: number;
    offset?: number;
    userId?: string;
  }): Promise<{ posts: Post[]; hasMore: boolean }> {
    // Basic feed implementation - gets latest posts
    // TODO: Implement proper feed logic (following, timelines, etc.)
    const limit = options.limit || 20;
    const offset = options.offset || 0;

    const posts = await this.postRepository.find(
      { visibility: 'public' }, // Simplistic filter
      { limit, skip: offset, sort: { published: -1 } }
    );
    const total = await this.postRepository.countDocuments({
      visibility: 'public',
    });
    const hasMore = offset + posts.length < total;

    return { posts, hasMore };
  }

  // --- Update Post ---
  async updatePost(
    postId: string,
    actorId: string | ObjectId,
    updates: UpdatePostData
  ): Promise<Post | null> {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new AppError('Post not found', 404, ErrorType.NOT_FOUND);
    }

    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    if (post.actorId.toHexString() !== actorObjectId.toHexString()) {
      throw new AppError(
        'User not authorized to update this post',
        403, // Forbidden status code
        ErrorType.FORBIDDEN
      );
    }

    // Construct the update object, only including fields present in updates
    const updatePayload: Partial<Post> = {};
    if (updates.content !== undefined) updatePayload.content = updates.content;
    if (updates.visibility !== undefined)
      updatePayload.visibility = updates.visibility;
    if (updates.sensitive !== undefined)
      updatePayload.sensitive = updates.sensitive;
    if (updates.summary !== undefined) updatePayload.summary = updates.summary;
    if (updates.attachments !== undefined)
      updatePayload.attachments = updates.attachments;
    updatePayload.updatedAt = new Date();

    return this.postRepository.findOneAndUpdate(
      { id: postId },
      { $set: updatePayload }
    );
  }

  // --- Delete Post ---
  async deletePost(
    postId: string,
    actorId: string | ObjectId
  ): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) {
      throw new AppError('Post not found', 404, ErrorType.NOT_FOUND);
    }

    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    if (post.actorId.toHexString() !== actorObjectId.toHexString()) {
      throw new AppError(
        'User not authorized to delete this post',
        403, // Forbidden status code
        ErrorType.FORBIDDEN
      );
    }

    // TODO: Handle ActivityPub Tombstone object creation/federation

    const result = await this.postRepository.deleteOne({ id: postId });
    return result;
  }

  // --- Like Post ---
  async likePost(
    postId: string,
    actorId: string | ObjectId
  ): Promise<Post | null> {
    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const updateResult = await this.postRepository.findOneAndUpdate(
      { id: postId },
      {
        $addToSet: { likedBy: actorObjectId }, // Add actor's internal ID
        $inc: { likesCount: 1 }, // Increment count
        $set: { updatedAt: new Date() },
      }
    );

    if (updateResult) {
      // TODO: Send notification to post author
      // this.notificationService.createNotification(...)
      // TODO: Federate Like activity
    }
    return updateResult;
  }

  // --- Unlike Post ---
  async unlikePost(
    postId: string,
    actorId: string | ObjectId
  ): Promise<Post | null> {
    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const updateResult = await this.postRepository.findOneAndUpdate(
      { id: postId, likedBy: actorObjectId }, // Ensure user has actually liked it
      {
        $pull: { likedBy: actorObjectId }, // Remove actor's internal ID
        $inc: { likesCount: -1 }, // Decrement count
        $set: { updatedAt: new Date() },
      }
    );

    if (updateResult) {
      // TODO: Federate Undo(Like) activity
    }
    return updateResult;
  }

  // --- Share Post (Boost) ---
  async sharePost(
    originalPostId: string,
    actorId: string | ObjectId
  ): Promise<Post | null> {
    // Sharing (Announce in AP) typically creates a *new* Post object of type Announce
    // that references the original post. For simplicity here, we'll just update counts.
    // A full implementation requires creating an Announce activity/post.

    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const updateResult = await this.postRepository.findOneAndUpdate(
      { id: originalPostId },
      {
        $addToSet: { sharedBy: actorObjectId },
        $inc: { sharesCount: 1 },
        $set: { updatedAt: new Date() },
      }
    );

    if (updateResult) {
      // TODO: Send notification to original post author
      // TODO: Federate Announce activity
    }
    return updateResult;
  }

  // --- Unshare Post (Undo Boost) ---
  async unsharePost(
    originalPostId: string,
    actorId: string | ObjectId
  ): Promise<Post | null> {
    const actorObjectId =
      typeof actorId === 'string' ? new ObjectId(actorId) : actorId;
    const updateResult = await this.postRepository.findOneAndUpdate(
      { id: originalPostId, sharedBy: actorObjectId },
      {
        $pull: { sharedBy: actorObjectId },
        $inc: { sharesCount: -1 },
        $set: { updatedAt: new Date() },
      }
    );

    if (updateResult) {
      // TODO: Federate Undo(Announce) activity
    }
    return updateResult;
  }
}
