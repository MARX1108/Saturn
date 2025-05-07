'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostService = void 0;
const uuid_1 = require('uuid');
const errors_1 = require('../../../utils/errors');
const mongodb_1 = require('mongodb');
class PostService {
  constructor(postRepository, actorService, domain, actorRepository) {
    this.postRepository = postRepository;
    this.actorService = actorService;
    this.domain = domain;
    this.actorRepository = actorRepository;
  }
  // Setter for NotificationService
  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }
  // Setter for ActorService (needed based on container.ts edit)
  setActorService(actorService) {
    this.actorService = actorService;
  }
  // --- Create Post ---
  async createPost(data) {
    // Validate actorId - improve string handling and error cases
    let actorObjectId;
    try {
      actorObjectId =
        typeof data.actorId === 'string'
          ? new mongodb_1.ObjectId(data.actorId)
          : data.actorId;
    } catch (error) {
      throw new errors_1.AppError(
        'Invalid actor ID format',
        400,
        errors_1.ErrorType.BAD_REQUEST
      );
    }
    // Ensure actor exists before proceeding
    const actor = await this.actorService.getActorById(actorObjectId);
    if (!actor) {
      throw new errors_1.AppError(
        'Author not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    const postId = (0, uuid_1.v4)();
    const postUrl = `https://${this.domain}/posts/${postId}`;
    const now = new Date();
    const newPost = {
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
      _id: new mongodb_1.ObjectId(),
    }); // Ensure _id is generated if not passed
    // TODO: Send notifications (e.g., to mentioned users)
    // TODO: Federate post via ActivityPub outbox
    return createdPost;
  }
  // --- Get Post By ID ---
  async getPostById(postId) {
    // Assuming postId is the ActivityPub ID (URL)
    return this.postRepository.findOne({ id: postId });
  }
  // --- Get Feed ---
  async getFeed(options = {}) {
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
  async getPostsByUsername(username, options) {
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
    postId, // AP ID (URL)
    actorId,
    updates
  ) {
    // Check ownership first using the repository method
    const isOwner = await this.postRepository.isOwner(postId, actorId);
    if (!isOwner) {
      throw new errors_1.AppError(
        'User not authorized to update this post',
        403,
        errors_1.ErrorType.FORBIDDEN
      );
    }
    // Call repository update method (which uses findOneAndUpdate)
    return this.postRepository.update(postId, updates);
  }
  // --- Delete Post ---
  async deletePost(
    postId, // AP ID (URL)
    actorId
  ) {
    // Check ownership first using the repository method
    const isOwner = await this.postRepository.isOwner(postId, actorId);
    if (!isOwner) {
      throw new errors_1.AppError(
        'User not authorized to delete this post',
        403,
        errors_1.ErrorType.FORBIDDEN
      );
    }
    // TODO: Handle ActivityPub Tombstone object creation/federation
    // Call repository deleteById method (which deletes by AP ID)
    return this.postRepository.deleteById(postId);
  }
  // Keep isOwner method, but have it call repository
  async isOwner(postId, actorId) {
    // Call repository method
    return this.postRepository.isOwner(postId, actorId);
  }
  // --- Like Post ---
  async likePost(postId, actorId) {
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
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
  async unlikePost(postId, actorId) {
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
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
  async sharePost(originalPostId, actorId) {
    // Sharing (Announce in AP) typically creates a *new* Post object of type Announce
    // that references the original post. For simplicity here, we'll just update counts.
    // A full implementation requires creating an Announce activity/post.
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
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
  async unsharePost(originalPostId, actorId) {
    const actorObjectId =
      typeof actorId === 'string' ? new mongodb_1.ObjectId(actorId) : actorId;
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
exports.PostService = PostService;
