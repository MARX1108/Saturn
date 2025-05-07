'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostsController = void 0;
const errors_1 = require('@/utils/errors');
const mongodb_1 = require('mongodb');
class PostsController {
  constructor(postService, actorService, uploadService, domain) {
    this.postService = postService;
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.domain = domain;
  }
  /**
   * Helper function to convert post to response format
   */
  async formatPostResponse(
    post,
    requestingActorId // Optional ID of the user making the request
  ) {
    // Use defined DTO
    if (!post.actorId) {
      throw new errors_1.AppError(
        'Post author information is missing.',
        500,
        errors_1.ErrorType.INTERNAL_SERVER_ERROR
      );
    }
    // Fetch author details if not already populated
    let author;
    if (post.actor && post.actor.id) {
      // Use pre-populated actor summary if available
      author = post.actor;
    } else {
      author = await this.actorService.getActorById(post.actorId);
    }

    // Handle case where author doesn't exist anymore
    if (!author) {
      console.warn(
        `Author not found for post ${post.id} with actorId ${post.actorId}`
      );
      // Create placeholder author for deleted accounts
      author = {
        id: post.actorId.toString(),
        username: 'deleted-user',
        preferredUsername: 'deleted-user',
        displayName: 'Deleted Account',
        name: 'Deleted Account',
      };
    }

    // Convert potential ObjectId to string for comparison
    const reqActorIdStr = requestingActorId
      ? new mongodb_1.ObjectId(requestingActorId).toHexString()
      : undefined;
    // Check if the requesting user has liked/shared this post
    const likedByUser = reqActorIdStr
      ? post.likedBy?.some(id => id.toHexString() === reqActorIdStr)
      : false;
    const sharedByUser = reqActorIdStr
      ? post.sharedBy?.some(id => id.toHexString() === reqActorIdStr)
      : false;
    return {
      id: post.id,
      content: post.content,
      author: {
        id: author.id,
        username: author.username, // Use full username
        preferredUsername: author.preferredUsername,
        displayName: author.displayName || author.name,
        iconUrl: author.icon?.url,
      },
      published: post.published.toISOString(),
      sensitive: post.sensitive,
      summary: post.summary,
      attachments: post.attachments,
      likes: post.likesCount || 0,
      likedByUser: likedByUser ?? false,
      shares: post.sharesCount || 0,
      sharedByUser: sharedByUser ?? false,
      replyCount: post.replyCount || 0,
      visibility: post.visibility,
      url: post.url,
    };
  }
  /**
   * Create a new post
   */
  async createPost(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      const actorId = req.user._id;
      // Data has already been validated by the Zod schema middleware
      // We can safely typecast here
      const validatedData = req.body;
      // Construct postData with validated data
      const postData = {
        ...validatedData,
        actorId,
      };
      const newPost = await this.postService.createPost(postData);
      const formattedPost = await this.formatPostResponse(
        newPost,
        actorId.toString()
      );
      res.status(201).json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get feed (public timeline)
   */
  async getFeed(req, res, next) {
    try {
      if (!req.user) {
        throw new errors_1.AppError(
          'Authentication required',
          401, // Unauthorized
          errors_1.ErrorType.AUTHENTICATION
        );
      }
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const userId = req.user?._id; // Get authenticated user ID if available
      // Pass options object to service
      const { posts, hasMore } = await this.postService.getFeed({
        page,
        limit,
      }); // <<< Use options object
      // Format posts
      const formattedPosts = await Promise.all(
        posts.map(post => this.formatPostResponse(post, userId?.toString()))
      );
      res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get single post by ID
   */
  async getPostById(req, res, next) {
    try {
      const postId = req.params.id;
      const post = await this.postService.getPostById(postId);
      if (!post) {
        throw new errors_1.AppError(
          'Post not found',
          404,
          errors_1.ErrorType.NOT_FOUND
        );
      }
      const userId = req.user?._id;
      const formattedPost = await this.formatPostResponse(
        post,
        userId?.toString()
      );
      res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get posts by username
   */
  async getPostsByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      // Calculate offset from page and limit
      const offset = (page - 1) * limit;
      // Call the service method to get posts by username
      const result = await this.postService.getPostsByUsername(username, {
        limit,
        offset,
      });
      // Format posts
      const formattedPosts = await Promise.all(
        result.posts.map(post =>
          this.formatPostResponse(post, req.user?._id?.toString() || undefined)
        )
      );
      // Calculate if there are more posts
      const hasMore = offset + formattedPosts.length < result.total;
      res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Update post
   */
  async updatePost(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      const actorId = req.user._id;
      const postId = req.params.id;
      // Data has already been validated by the Zod schema middleware
      const validatedData = req.body;
      // Use imported UpdatePostData type
      const updateData = validatedData;
      const updatedPost = await this.postService.updatePost(
        postId,
        actorId,
        updateData
      );
      if (!updatedPost) {
        throw new errors_1.AppError(
          'Post not found or user not authorized',
          404,
          errors_1.ErrorType.NOT_FOUND
        );
      }
      // Format post
      const formattedPost = await this.formatPostResponse(
        updatedPost,
        actorId.toString()
      );
      res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Delete post
   */
  async deletePost(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;
      const success = await this.postService.deletePost(postId, actorId);
      if (!success) {
        throw new errors_1.AppError(
          'Post not found or user not authorized',
          404,
          errors_1.ErrorType.NOT_FOUND
        );
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
  /**
   * Like a post
   */
  async likePost(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;
      const liked = await this.postService.likePost(postId, actorId);
      if (!liked) {
        throw new errors_1.AppError(
          'Post already liked or not found',
          400, // Bad Request
          errors_1.ErrorType.VALIDATION // Or a different type?
        );
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  /**
   * Unlike a post
   */
  async unlikePost(req, res, next) {
    try {
      if (!req.user?._id) {
        throw new errors_1.AppError(
          'Authentication required',
          401,
          errors_1.ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;
      const unliked = await this.postService.unlikePost(postId, actorId);
      if (!unliked) {
        throw new errors_1.AppError(
          'Post not liked or not found',
          400, // Bad Request
          errors_1.ErrorType.VALIDATION // Or a different type?
        );
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
exports.PostsController = PostsController;
