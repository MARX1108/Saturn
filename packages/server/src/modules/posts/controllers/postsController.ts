import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { PostService } from '../services/postService';
import { ActorService } from '../../actors/services/actorService';
import { Attachment, PostResponse, Post } from '../models/post';
import { UploadService } from '../../media/services/upload.service';
import { DbUser } from '../../auth/models/user';
import { CommentService } from '../../comments/services/comment.service';
import { Comment } from '../../comments/models/comment';
import { AppError, ErrorType } from '../../../utils/errors';

export class PostsController {
  private postService: PostService;
  private actorService: ActorService;
  private uploadService: UploadService;
  private domain: string;

  constructor(
    postService: PostService,
    actorService: ActorService,
    uploadService: UploadService,
    domain: string
  ) {
    this.postService = postService;
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.domain = domain;
  }

  /**
   * Helper function to convert post to response format
   */
  private async formatPostResponse(
    post: Post,
    userId?: string
  ): Promise<PostResponse> {
    const actor = await this.actorService.getActorById(post.actor.id);
    // Cast userId to string or undefined to avoid null
    const safeUserId = userId || undefined;
    const likedByUser = safeUserId
      ? post.likes?.includes(safeUserId) || false
      : false;

    return {
      id: post.id,
      content: post.content,
      author: {
        id: post.actor.id,
        username: post.actor.username,
        displayName: actor?.name || post.actor.username,
        avatarUrl: actor?.icon?.url,
      },
      attachments: post.attachments,
      createdAt: post.published.toISOString(),
      sensitive: post.sensitive,
      contentWarning: post.contentWarning,
      likes: post.likes?.length || 0,
      likedByUser,
      shares: post.shares || 0,
    };
  }

  /**
   * Create a new post
   */
  async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', ErrorType.Unauthorized);
      }
      const userId = req.user.id || '';
      const actor = await this.actorService.getActorById(userId);

      if (!actor) {
        throw new AppError('User not found', ErrorType.NotFound);
      }

      const { content, sensitive, contentWarning } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!content && (!files || files.length === 0)) {
        throw new AppError(
          'Post must contain content or attachments',
          ErrorType.BadRequest
        );
      }

      // Process attachments
      const attachments: Attachment[] = [];

      if (files && files.length > 0) {
        // Move files to public directory
        const publicDir = path.join(process.cwd(), 'public', 'media');
        fs.mkdirSync(publicDir, { recursive: true });

        for (const file of files) {
          const fileName = `${Date.now()}-${file.originalname.replace(
            /\s/g,
            '_'
          )}`;
          const finalPath = path.join(publicDir, fileName);

          fs.renameSync(file.path, finalPath);

          attachments.push({
            url: `https://${this.domain}/media/${fileName}`,
            type: file.mimetype.startsWith('image/')
              ? 'Image'
              : file.mimetype.startsWith('video/')
                ? 'Video'
                : 'Document',
            mediaType: file.mimetype,
          });
        }
      }

      // Create post
      const post = await this.postService.createPost({
        content: content || '',
        username: actor.preferredUsername || '',
        sensitive: sensitive === true,
        contentWarning: contentWarning || '',
        attachments,
      });

      // Format response
      const formattedPost = await this.formatPostResponse(post, userId);

      res.status(201).json(formattedPost);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get feed (public timeline)
   */
  async getFeed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', ErrorType.Unauthorized);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { posts, hasMore } = await this.postService.getFeed(page, limit);

      // Format posts
      const formattedPosts = await Promise.all(
        posts.map(post =>
          this.formatPostResponse(post, req.user?.id || undefined)
        )
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
  async getPostById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const post = await this.postService.getPostById(req.params.id);
      if (!post) {
        throw new AppError('Post not found', ErrorType.NotFound);
      }
      const formattedPost = await this.formatPostResponse(post, req.user?.id);
      res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get posts by username
   */
  async getPostsByUsername(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Calculate offset from page and limit
      const offset = (page - 1) * limit;

      const result = await this.postService.getPostsByUsername(username, {
        limit,
        offset,
      });

      // Format posts
      const formattedPosts = await Promise.all(
        result.posts.map((post: Post) =>
          this.formatPostResponse(post, req.user?.id || undefined)
        )
      );

      // Calculate if there are more posts
      const hasMore = result.offset + result.posts.length < result.total;

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
  async updatePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', ErrorType.Unauthorized);
      }
      const { id } = req.params;
      const userId = req.user.id || '';
      const { content, sensitive, contentWarning } = req.body;

      const post = await this.postService.updatePost(id, userId, {
        content,
        sensitive,
        contentWarning,
      });

      if (!post) {
        throw new AppError(
          'Post not found or not authorized',
          ErrorType.NotFound
        );
      }

      // Format post
      const formattedPost = await this.formatPostResponse(post, userId);

      res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete post
   */
  async deletePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', ErrorType.Unauthorized);
      }
      const { id } = req.params;
      const userId = req.user.id || '';

      const deleted = await this.postService.deletePost(id, userId);

      if (!deleted) {
        throw new AppError(
          'Post not found or not authorized',
          ErrorType.NotFound
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
  async likePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', ErrorType.Unauthorized);
      }
      const { id } = req.params;
      const userId = req.user.id || '';

      const liked = await this.postService.likePost(id, userId);

      if (!liked) {
        throw new AppError(
          'Post already liked or not found',
          ErrorType.BadRequest
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
  async unlikePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', ErrorType.Unauthorized);
      }
      const { id } = req.params;
      const userId = req.user.id || '';

      const unliked = await this.postService.unlikePost(id, userId);

      if (!unliked) {
        throw new AppError('Post not liked or not found', ErrorType.BadRequest);
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
