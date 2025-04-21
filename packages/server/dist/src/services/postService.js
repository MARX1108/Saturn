'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostService = void 0;
const mongodb_1 = require('mongodb');
const postRepository_1 = require('../repositories/postRepository');
const plugins_1 = require('../plugins');
class PostService {
  constructor(db, domain) {
    this.repository = new postRepository_1.PostRepository(db);
    this.domain = domain;
  }
  async createPost(postData, actorId) {
    // Create a new post
    const post = {
      content: postData.content,
      actorId: new mongodb_1.ObjectId(actorId),
      createdAt: new Date(),
      sensitive: postData.sensitive || false,
      contentWarning: postData.contentWarning || '',
      attachments: postData.attachments || [],
      likes: 0,
      replies: 0,
      reposts: 0,
      // Add ActivityPub fields for federation
      type: 'Note',
      id: `https://${this.domain}/posts/${new mongodb_1.ObjectId()}`,
      attributedTo: `https://${this.domain}/users/${postData.username}`,
    };
    const createdPost = await this.repository.create(post);
    // Trigger plugin hook for new posts
    try {
      (0, plugins_1.executeHook)('onNewPost', createdPost);
    } catch (error) {
      console.error('Error in post creation hook:', error);
    }
    return createdPost;
  }
  async getPostById(postId) {
    return this.repository.findById(postId);
  }
  async getPostsByUsername(username, page = 1, limit = 20) {
    return this.repository.getPostsByUsername(username, page, limit);
  }
  async getFeed(page = 1, limit = 20) {
    return this.repository.getFeed(page, limit);
  }
  async updatePost(postId, actorId, updates) {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return null;
    }
    // Update the post
    const updateData = {
      content: updates.content,
      sensitive: updates.sensitive || false,
      contentWarning: updates.contentWarning || '',
    };
    const success = await this.repository.update(postId, updateData);
    if (!success) {
      return null;
    }
    return this.repository.findById(postId);
  }
  async deletePost(postId, actorId) {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return false;
    }
    return this.repository.delete(postId);
  }
  async likePost(postId, _actorId) {
    // TODO: Implement like tracking to prevent multiple likes
    // For now, just increment the like count
    return this.repository.likePost(postId);
  }
  async unlikePost(postId, _actorId) {
    // TODO: Check if the user has liked the post before decrementing
    return this.repository.unlikePost(postId);
  }
}
exports.PostService = PostService;
