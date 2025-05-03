'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.CommentService = void 0;
const notification_1 = require('../../notifications/models/notification');
const errors_1 = require('../../../utils/errors');
const mongodb_1 = require('mongodb');
class CommentService {
  constructor(repository) {
    this.repository = repository;
  }
  setPostService(postService) {
    this.postService = postService;
  }
  setActorService(actorService) {
    this.actorService = actorService;
  }
  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }
  /**
   * Create a new comment on a post
   * @param postId - The ID of the post
   * @param authorId - The ID of the comment author
   * @param content - The comment text content
   */
  async createComment(postId, authorId, data) {
    const post = await this.postService.getPostById(postId.toString());
    if (!post) {
      throw new errors_1.AppError(
        'Post not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    const actor = await this.actorService.getActorById(authorId);
    if (!actor) {
      throw new errors_1.AppError(
        'Author not found',
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    const now = new Date();
    const commentData = {
      ...data,
      actorId: actor._id,
      postId: post._id.toHexString(),
      createdAt: now,
      updatedAt: now,
      likesCount: 0,
      likedBy: [],
    };
    const createdComment = await this.repository.create(commentData);
    // Send notification to post author (if different from comment author)
    if (post.actorId.toHexString() !== actor._id.toHexString()) {
      const commentIdForNotification =
        createdComment._id instanceof mongodb_1.ObjectId
          ? createdComment._id.toHexString()
          : createdComment._id; // Assume it's string if not ObjectId
      await this.notificationService.createNotification({
        recipientUserId: post.actorId.toHexString(),
        actorUserId: actor._id.toHexString(),
        type: notification_1.NotificationType.COMMENT,
        postId: post._id.toHexString(),
        commentId: commentIdForNotification, // <<< Use checked variable
      });
    }
    // Process mentions in content to send notifications
    await this.processMentions(
      data.content,
      authorId,
      postId,
      createdComment._id // Pass original id here
    );
    return createdComment;
  }
  /**
   * Get comments for a specific post
   * @param postId - The ID of the post
   * @param paginationOptions - Pagination options (limit, offset)
   */
  async getCommentsForPost(postId, paginationOptions) {
    // Check if post exists (optional)
    const post = await this.postService.getPostById(postId);
    if (!post) {
      throw new errors_1.AppError(
        `Post with ID ${postId} not found`,
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    // Get comments with pagination
    const { comments, total } = await this.repository.findCommentsByPostId(
      postId,
      paginationOptions
    );
    // Format comments with author details
    const formattedComments = await Promise.all(
      comments.map(async comment => {
        const author = await this.actorService.getActorById(comment.authorId);
        return this.formatComment(comment, author);
      })
    );
    return {
      comments: formattedComments,
      total,
      limit: paginationOptions.limit,
      offset: paginationOptions.offset,
    };
  }
  /**
   * Delete a comment
   * @param commentId - The ID of the comment to delete
   * @param requestingUserId - The ID of the user making the delete request
   */
  async deleteComment(commentId, requestingUserId) {
    const result = await this.repository.deleteByIdAndAuthorId(
      commentId,
      requestingUserId
    );
    if (result.deletedCount === 0) {
      throw new errors_1.AppError(
        "Comment not found or you don't have permission to delete it",
        404,
        errors_1.ErrorType.NOT_FOUND
      );
    }
    return true;
  }
  /**
   * Helper method to format a comment with author details
   * @private
   */
  formatComment(comment, author) {
    return {
      ...comment,
      author: {
        id: comment.authorId,
        username: author?.preferredUsername || 'unknown',
        displayName:
          author?.name || author?.preferredUsername || 'Unknown User',
        avatarUrl: author?.icon?.url,
      },
    };
  }
  /**
   * Process mentions in comment content to send notifications
   * @private
   */
  async processMentions(content, authorId, postId, commentId) {
    const mentions = content.match(/@([a-zA-Z0-9_]+)/g);
    if (!mentions) return;
    for (const mention of mentions) {
      const username = mention.substring(1);
      const mentionedUser =
        await this.actorService.getActorByUsername(username);
      if (
        mentionedUser &&
        mentionedUser._id.toHexString() !==
          (typeof authorId === 'string' ? authorId : authorId.toHexString())
      ) {
        const commentIdForNotification =
          commentId instanceof mongodb_1.ObjectId
            ? commentId.toHexString()
            : commentId; // Assume string if not ObjectId
        const notificationDto = {
          type: notification_1.NotificationType.MENTION,
          recipientUserId: mentionedUser._id.toHexString(),
          actorUserId:
            typeof authorId === 'string' ? authorId : authorId.toHexString(),
          content: `mentioned you in a comment: ${content.substring(0, 50)}...`,
          postId: typeof postId === 'string' ? postId : postId.toHexString(),
          commentId: commentIdForNotification, // <<< Use checked variable
        };
        await this.notificationService.createNotification(notificationDto);
      }
    }
  }
  getComments(_postId) {
    // For backwards compatibility, return empty array
    return Promise.resolve([]);
  }
}
exports.CommentService = CommentService;
