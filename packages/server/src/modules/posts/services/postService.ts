import { v4 as uuidv4 } from 'uuid';
import { Post, Attachment } from '../../../modules/posts/models/post';
import { PostRepository } from '../../../modules/posts/repositories/postRepository';
import { ActorService } from '../../../modules/actors/services/actorService';
import { NotificationService } from '../../../modules/notifications/services/notification.service';
import { AppError, ErrorType } from '../../../utils/errors';
import { ObjectId } from 'mongodb';
import { ActorRepository } from '../../../modules/actors/repositories/actorRepository';

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
  private notificationService!: NotificationService; // Mark for definite assignment

  constructor(
    private postRepository: PostRepository,
    private actorService: ActorService,
    private domain: string,
    private actorRepository: ActorRepository
  ) {}

  // Setter for NotificationService
  public setNotificationService(
    notificationService: NotificationService
  ): void {
    this.notificationService = notificationService;
  }

  // Setter for ActorService (needed based on container.ts edit)
  public setActorService(actorService: ActorService): void {
    this.actorService = actorService;
  }

  // --- Create Post ---
  async createPost(data: CreatePostData): Promise<Post> {
    // Validate actorId - improve string handling and error cases
    let actorObjectId;
    console.log('[PostService] CreatePost actorId: type:', typeof data.actorId);
    // First attempt to convert to ObjectId if it's a string
    if (typeof data.actorId === 'string') {
      try {
        actorObjectId = new ObjectId(data.actorId);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // If that fails, throw an error since actorId must be an ObjectId
        throw new AppError(
          'Invalid actor ID format',
          400,
          ErrorType.BAD_REQUEST
        );
      }
    } else {
      actorObjectId = data.actorId;
    }
    console.log('[PostService] Processed actorId:', actorObjectId);

    // Try multiple approaches to find the actor
    let actor = null;

    // Attempt 1: Try using the actorObjectId directly
    console.log(
      '[PostService] Attempt 1: Looking up actor with objectId:',
      actorObjectId
    );
    actor = await this.actorService.getActorById(actorObjectId);

    // Attempt 2: If actorObjectId is an ObjectId, try its string representation
    if (!actor) {
      const idString = actorObjectId.toString();
      console.log(
        '[PostService] Attempt 2: Looking up actor with string id:',
        idString
      );
      actor = await this.actorService.getActorById(idString);
    }

    // Since actorObjectId is now always an ObjectId, we don't need the type checks
    // for string methods, but we can still try lookups by URL or username if needed
    // using the string representation

    // Attempt 3: Try looking up by string representations
    if (!actor) {
      const idString = actorObjectId.toString();

      console.log(
        '[PostService] Attempt 3: Looking up actor by string representation:',
        idString
      );

      // Try as AP ID if it looks like a URL
      if (idString.startsWith('http')) {
        console.log('[PostService] Trying as AP ID');
        actor = await this.actorService.getActorByApId(idString);
      }

      // Try as username if it doesn't contain slashes
      if (!actor && !idString.includes('/')) {
        console.log('[PostService] Trying as username');
        actor = await this.actorService.getActorByUsername(idString);
      }
    }

    // Attempt 4: Last resort, try querying the actor repository directly with _id
    if (!actor) {
      console.log(
        '[PostService] Attempt 4: Querying actor repository directly'
      );
      try {
        actor = await this.actorRepository.findOne({ _id: actorObjectId });
      } catch (e) {
        console.error('[PostService] Final attempt error:', e);
      }
    }

    console.log(
      '[PostService] Actor lookup final result:',
      actor ? 'Found' : 'Not found'
    );
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
      summary: data.summary, // Optional summary
      attachments: data.attachments || [],
      published: now, // Set published time
      createdAt: now, // Set internal createdAt
      updatedAt: now, // Set internal updatedAt
      attributedTo: `${actor.id}/${String(actorObjectId)}`,
      to: [], // Initialize, will be set based on visibility
      cc: [], // Initialize, will be set based on visibility
      url: postUrl, // Canonical AP URL
      replyCount: 0, // Initialize count
      likesCount: 0, // Initialize count
      sharesCount: 0, // Initialize count
      likedBy: [], // Initialize array
      sharedBy: [], // Initialize array
      // inReplyTo: data.inReplyTo, // Add if supporting replies
      // tag: [], // Initialize if supporting tags/mentions
    };

    // Adjust to/cc based on visibility
    if (newPost.visibility === 'followers') {
      newPost.to = [actor.followers]; // Send to followers collection
      newPost.cc = []; // Maybe add mentions later
    } else if (newPost.visibility === 'public') {
      newPost.to = ['https://www.w3.org/ns/activitystreams#Public'];
      newPost.cc = [actor.followers]; // Also CC followers
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
  async getFeed(
    options: { page?: number; limit?: number } = {}
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const { page = 1, limit = 20 } = options; // Destructure options
    const skip = (page - 1) * limit;

    // Call repository's findFeed method
    const posts = await this.postRepository.findFeed({
      sort: { published: -1 }, // Default sort
      skip,
      limit: limit + 1, // Fetch one extra to check if there's more
    });

    const hasMore = posts.length > limit;
    const paginatedPosts = posts.slice(0, limit);

    // Populate actor data for each post
    const populatedPosts = await Promise.all(
      paginatedPosts.map(async post => {
        if (!post.actor && post.actorId) {
          try {
            const fetchedActor = await this.actorService.getActorById(
              post.actorId.toString()
            );
            post.actor = fetchedActor || undefined;
          } catch (error) {
            console.error(
              `Failed to populate actor ${String(post.actorId)} for post ${String(post._id)}:`,
              error
            );
            // Simply continue without the actor data
            // The controller's formatPostResponse will handle this case
          }
        }
        return post;
      })
    );

    return { posts: populatedPosts, hasMore };
  }

  // Add getPostsByUsername - DEFERRED IMPLEMENTATION
  async getPostsByUsername(
    username: string,
    options: { limit: number; offset: number }
  ): Promise<{ posts: Post[]; total: number; offset: number }> {
    try {
      const actor = await this.actorRepository.findByUsername(username);

      if (!actor) {
        return { posts: [], total: 0, offset: options.offset };
      }

      const [posts, total] = await Promise.all([
        this.postRepository.findByActorId(actor._id.toString(), options),
        this.postRepository.countByActorId(actor._id.toString()),
      ]);

      return {
        posts,
        total,
        offset: options.offset,
      };
    } catch (error) {
      console.error(`Error fetching posts for username ${username}:`, error);
      return { posts: [], total: 0, offset: options.offset };
    }
  }

  // --- Update Post ---
  async updatePost(
    postId: string, // AP ID (URL)
    actorId: string | ObjectId,
    updates: UpdatePostData
  ): Promise<Post | null> {
    // Check ownership first using the repository method
    const isOwner = await this.postRepository.isOwner(postId, actorId);
    if (!isOwner) {
      throw new AppError(
        'User not authorized to update this post',
        403,
        ErrorType.FORBIDDEN
      );
    }
    // Call repository update method (which uses findOneAndUpdate)
    return this.postRepository.update(postId, updates);
  }

  // --- Delete Post ---
  async deletePost(
    postId: string, // AP ID (URL)
    actorId: string | ObjectId
  ): Promise<boolean> {
    // Check ownership first using the repository method
    const isOwner = await this.postRepository.isOwner(postId, actorId);
    if (!isOwner) {
      throw new AppError(
        'User not authorized to delete this post',
        403,
        ErrorType.FORBIDDEN
      );
    }

    // TODO: Handle ActivityPub Tombstone object creation/federation

    // Call repository deleteById method (which deletes by AP ID)
    return this.postRepository.deleteById(postId);
  }

  // Keep isOwner method, but have it call repository
  async isOwner(postId: string, actorId: string | ObjectId): Promise<boolean> {
    // Call repository method
    return this.postRepository.isOwner(postId, actorId);
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
