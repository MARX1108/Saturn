'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostService = void 0;
const notification_1 = require('../../notifications/models/notification');
const errors_1 = require('../../../utils/errors');
class PostService {
  constructor(repository, actorService, notificationService, domain) {
    this.repository = repository;
    this.actorService = actorService;
    this.notificationService = notificationService;
    this.domain = domain;
  }
  async createPost(request) {
    const actor = await this.actorService.getActorByUsername(request.username);
    if (!actor) {
      throw new errors_1.AppError(
        'Actor not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    if (!actor._id) {
      throw new errors_1.AppError(
        'Actor ID is missing',
        500,
        errors_1.ErrorType.SERVER_ERROR
      );
    }
    const post = {
      id: `${process.env.APP_URL}/api/posts/${Date.now()}`,
      authorId: actor._id,
      content: request.content,
      visibility: 'public',
      published: new Date(),
      updated: new Date(),
      type: 'Note',
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [],
      attributedTo: `${process.env.APP_URL}/api/actors/${actor._id}`,
      url: `${process.env.APP_URL}/api/posts/${Date.now()}`,
      replies: [],
      likes: [],
      shares: 0,
      sensitive: request.sensitive || false,
      contentWarning: request.contentWarning,
      actor: {
        id: actor._id,
        username: actor.preferredUsername,
      },
      attachments: request.attachments || [],
    };
    return this.repository.create(post);
  }
  async getPostById(id) {
    console.log('!!! DEBUG: Entering PostService.getPostById with id:', id);
    return this.repository.findById(id);
  }
  async getFeed(page = 1, limit = 20) {
    const posts = await this.repository.findFeed(page, limit);
    const total = await this.repository.countFeed();
    return {
      posts,
      hasMore: page * limit < total,
    };
  }
  async getPostsByUsername(username, paginationOptions, requestingUserId) {
    // Find the actor by username
    const actor = await this.actorService.getActorByUsername(username);
    if (!actor) {
      throw new errors_1.AppError(
        `Actor with username ${username} not found`,
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    // Get the actor ID and ensure it's a string
    const authorId = actor._id;
    if (!authorId) {
      throw new errors_1.AppError(
        'Actor ID is unexpectedly undefined',
        500,
        errors_1.ErrorType.SERVER_ERROR
      );
    }
    // Fetch posts by author ID with pagination
    const { posts, total } = await this.repository.findPostsByAuthorId(
      authorId,
      paginationOptions
    );
    return {
      posts,
      total,
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
    };
  }
  async updatePost(id, actorId, updates) {
    // First, check if the post exists and belongs to the actor
    const post = await this.repository.findByIdAndActorId(id, actorId);
    if (!post) {
      return null;
    }
    // Update the post
    const updateData = {
      content: updates.content || post.content,
      sensitive: updates.sensitive ?? post.sensitive,
      contentWarning: updates.contentWarning,
    };
    return this.repository.updateById(id, updateData);
  }
  async deletePost(id, actorId) {
    // First, check if the post exists and belongs to the actor
    const post = await this.repository.findByIdAndActorId(id, actorId);
    if (!post) {
      return false;
    }
    // Delete the post
    return this.repository.deleteById(id);
  }
  async likePost(id, actorId) {
    const post = await this.repository.findById(id);
    if (!post) {
      return false;
    }
    // Check if already liked
    if (post.likes && post.likes.includes(actorId)) {
      return false;
    }
    const success = await this.repository.likePost(id, actorId);
    if (success) {
      // Create notification for the post author
      await this.notificationService.createNotification({
        recipientUserId: post.authorId,
        actorUserId: actorId,
        type: notification_1.NotificationType.LIKE,
        postId: id,
        read: false,
      });
    }
    return success;
  }
  async unlikePost(id, actorId) {
    const post = await this.repository.findById(id);
    if (!post) {
      return false;
    }
    // Check if liked
    if (!post.likes || !post.likes.includes(actorId)) {
      return false;
    }
    return this.repository.unlikePost(id, actorId);
  }
}
exports.PostService = PostService;
