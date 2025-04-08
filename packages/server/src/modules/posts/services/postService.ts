import { Db } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { Post, CreatePostRequest, UpdatePostRequest } from "../models/post";
import { PostRepository } from "../repositories/postRepository";

export class PostService {
  private repository: PostRepository;
  private domain: string;

  constructor(repository: PostRepository, domain: string) {
    this.repository = repository;
    this.domain = domain;
  }

  async createPost(
    postData: CreatePostRequest,
    actorId: string,
  ): Promise<Post> {
    // Create a new post ID
    const postId = uuidv4();

    // Create post object
    const newPost: Post = {
      id: postId,
      content: postData.content,
      actor: {
        id: actorId,
        username: postData.username,
      },
      attachments: postData.attachments || [],
      createdAt: new Date(),
      sensitive: postData.sensitive || false,
      contentWarning: postData.contentWarning,
      likes: [],
      shares: 0,
    };

    // Create post in repository
    return this.repository.create(newPost);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.repository.findById(id);
  }

  async getFeed(
    page = 1,
    limit = 20,
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const posts = await this.repository.findFeed(page, limit);
    const total = await this.repository.countFeed();

    return {
      posts,
      hasMore: page * limit < total,
    };
  }

  async getPostsByUsername(
    username: string,
    page = 1,
    limit = 20,
  ): Promise<{ posts: Post[]; hasMore: boolean }> {
    const posts = await this.repository.findByUsername(username, page, limit);
    const total = await this.repository.countByUsername(username);

    return {
      posts,
      hasMore: page * limit < total,
    };
  }

  async updatePost(
    id: string,
    actorId: string,
    updates: UpdatePostRequest,
  ): Promise<Post | null> {
    // First, check if the post exists and belongs to the actor
    const post = await this.repository.findByIdAndActorId(id, actorId);

    if (!post) {
      return null;
    }

    // Update the post
    const updateData: Partial<Post> = {
      content: updates.content || post.content,
      sensitive: updates.sensitive ?? post.sensitive,
      contentWarning: updates.contentWarning,
    };

    return this.repository.updateById(id, updateData);
  }

  async deletePost(id: string, actorId: string): Promise<boolean> {
    // First, check if the post exists and belongs to the actor
    const post = await this.repository.findByIdAndActorId(id, actorId);

    if (!post) {
      return false;
    }

    // Delete the post
    return this.repository.deleteById(id);
  }

  async likePost(id: string, actorId: string): Promise<boolean> {
    const post = await this.repository.findById(id);

    if (!post) {
      return false;
    }

    // Check if already liked
    if (post.likes && post.likes.includes(actorId)) {
      return false;
    }

    return this.repository.likePost(id, actorId);
  }

  async unlikePost(id: string, actorId: string): Promise<boolean> {
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
