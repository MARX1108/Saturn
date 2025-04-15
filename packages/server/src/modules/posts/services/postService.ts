import { Db as _Db } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { Post, CreatePostRequest, UpdatePostRequest } from '../models/post';
import { PostRepository } from '../repositories/postRepository';
import { ActorService } from '../../actors/services/actorService';
import { AppError, ErrorType } from '../../../utils/errors';

export class PostService {
  private repository: PostRepository;
  private actorService: ActorService;
  private domain: string;

  constructor(
    repository: PostRepository,
    actorService: ActorService,
    domain: string
  ) {
    this.repository = repository;
    this.actorService = actorService;
    this.domain = domain;
  }

  async createPost(
    authorId: string,
    content: string,
    visibility: 'public' | 'private' = 'public'
  ): Promise<Post> {
    const post = new Post();
    post.authorId = authorId;
    post.content = content;
    post.visibility = visibility;
    post.published = new Date();
    post.updated = new Date();
    post.type = 'Note';
    post.to =
      visibility === 'public'
        ? ['https://www.w3.org/ns/activitystreams#Public']
        : [];
    post.cc = [];
    post.attributedTo = `${process.env.APP_URL}/api/actors/${authorId}`;
    post.url = `${process.env.APP_URL}/api/posts/${post.id}`;
    post.replies = [];
    post.likes = [];
    post.shares = [];
    return this.repository.save(post);
  }

  async getPostById(id: string): Promise<Post | null> {
    return this.repository.findById(id);
  }

  async getFeed(
    page = 1,
    limit = 20
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
    paginationOptions: { limit: number; offset: number }
  ): Promise<{ posts: Post[]; total: number; limit: number; offset: number }> {
    // Find the actor by username
    const actor = await this.actorService.getActorByUsername(username);

    if (!actor) {
      throw new AppError(
        `Actor with username ${username} not found`,
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Get the actor ID and ensure it's a string
    const authorId = actor._id;

    if (!authorId) {
      throw new AppError(
        'Actor ID is unexpectedly undefined',
        500,
        ErrorType.SERVER_ERROR
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

  async updatePost(
    id: string,
    actorId: string,
    updates: UpdatePostRequest
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
