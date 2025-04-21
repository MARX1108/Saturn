import { Db, ObjectId } from 'mongodb';
import { Post } from '@/modules/posts/models/post';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { executeHook } from '../plugins';
import { ActorService } from '@/modules/actors/services/actorService';
import { NotificationService } from '@/modules/notifications/services/notification.service';

export class PostService {
  constructor(
    private repository: PostRepository,
    private actorService: ActorService,
    private domain: string,
    private notificationService?: NotificationService
  ) {}

  async createPost(postInputData: any, actorId: ObjectId): Promise<Post> {
    // Create a new post
    const post = {
      content: postInputData.content,
      actorId: actorId,
      createdAt: new Date(),
      sensitive: postInputData.sensitive || false,
      attachments: postInputData.attachments || [],
      likes: 0,
      replies: 0,
      reposts: 0,
      // Add ActivityPub fields for federation
      type: 'Note',
      id: `https://${this.domain}/posts/${new ObjectId()}`,
      attributedTo: `https://${this.domain}/users/${postInputData.username}`,
    } as Post;

    const createdPost = await this.repository.create(post);

    // Trigger plugin hook for new posts
    try {
      executeHook('onNewPost', createdPost);
    } catch (error) {
      console.error('Error in post creation hook:', error);
    }

    return createdPost;
  }

  async getPostById(postId: string): Promise<Post | null> {
    return this.repository.findById(postId);
  }

  async getPostsByUsername(
    username: string,
    page = 1,
    limit = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    return this.repository.getPostsByUsername(username, page, limit);
  }

  async getFeed(
    page = 1,
    limit = 20
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    return this.repository.getFeed(page, limit);
  }

  async updatePost(
    postId: string,
    actorId: ObjectId,
    updates: Partial<any>
  ): Promise<Post | null> {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return null;
    }

    // Update the post
    const updateData: Partial<Post> = {};
    if (updates.content) updateData.content = updates.content;
    if (updates.sensitive !== undefined)
      updateData.sensitive = updates.sensitive;

    const success = await this.repository.update(postId, updateData);
    if (!success) {
      return null;
    }

    return this.repository.findById(postId);
  }

  async deletePost(postId: string, actorId: string): Promise<boolean> {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return false;
    }

    return this.repository.delete(postId);
  }

  async likePost(postId: string, actorId: string): Promise<boolean> {
    // Basic implementation, might need more checks (e.g., already liked?)
    return this.repository.likePost(postId, actorId);
  }

  async unlikePost(postId: string, actorId: string): Promise<boolean> {
    return this.repository.unlikePost(postId, actorId);
  }
}
