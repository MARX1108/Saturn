import { Db, ObjectId } from 'mongodb';
import { Post } from '@/modules/posts/models/post';
import { PostRepository } from '@/modules/posts/repositories/postRepository';
import { executeHook } from '../plugins';

export class PostService {
  private repository: PostRepository;
  private domain: string;

  constructor(db: Db, domain: string) {
    this.repository = new PostRepository(db);
    this.domain = domain;
  }

  async createPost(
    postData: CreatePostRequest,
    actorId: string
  ): Promise<Post> {
    // Create a new post
    const post = {
      content: postData.content,
      actorId: new ObjectId(actorId),
      createdAt: new Date(),
      sensitive: postData.sensitive || false,
      contentWarning: postData.contentWarning || '',
      attachments: postData.attachments || [],
      likes: 0,
      replies: 0,
      reposts: 0,
      // Add ActivityPub fields for federation
      type: 'Note',
      id: `https://${this.domain}/posts/${new ObjectId()}`,
      attributedTo: `https://${this.domain}/users/${postData.username}`,
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
    actorId: string,
    updates: Partial<CreatePostRequest>
  ): Promise<Post | null> {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return null;
    }

    // Update the post
    const updateData: Partial<Post> = {
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

  async deletePost(postId: string, actorId: string): Promise<boolean> {
    // Verify ownership
    const isOwner = await this.repository.isOwner(postId, actorId);
    if (!isOwner) {
      return false;
    }

    return this.repository.delete(postId);
  }

  async likePost(postId: string, _actorId: string): Promise<boolean> {
    // TODO: Implement like tracking to prevent multiple likes
    // For now, just increment the like count
    return this.repository.likePost(postId);
  }

  async unlikePost(postId: string, _actorId: string): Promise<boolean> {
    // TODO: Check if the user has liked the post before decrementing
    return this.repository.unlikePost(postId);
  }
}
