import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { PostService } from '../services/postService';
import { ActorService } from '../../actors/services/actorService';
import { Attachment, PostResponse, Post } from '../models/post';
import { UploadService } from '../../media/services/upload.service';
import { DbUser } from '../../../modules/auth/models/user';

// Extend Request type locally for this controller
interface RequestWithUser extends Request {
  user?: DbUser;
  files?: Express.Multer.File[];
}

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
      createdAt: post.createdAt.toISOString(),
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
  async createPost(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      // Get user from token
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';
      const actor = await this.actorService.getActorById(userId);

      if (!actor) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { content, sensitive, contentWarning } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!content && (!files || files.length === 0)) {
        return res
          .status(400)
          .json({ error: 'Post must contain content or attachments' });
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
      const post = await this.postService.createPost(
        {
          content: content || '',
          username: actor.preferredUsername || '',
          sensitive: sensitive === 'true',
          contentWarning: contentWarning || '',
          attachments,
        },
        userId
      );

      // Format response
      const formattedPost = await this.formatPostResponse(post, userId);

      return res.status(201).json(formattedPost);
    } catch (error) {
      console.error('Error creating post:', error);
      return res.status(500).json({ error: 'Failed to create post' });
    }
  }

  /**
   * Get feed (public timeline)
   */
  async getFeed(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { posts, hasMore } = await this.postService.getFeed(page, limit);

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format posts
      const formattedPosts = await Promise.all(
        posts.map(post => this.formatPostResponse(post, userId || undefined))
      );

      return res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      console.error('Error getting posts:', error);
      return res.status(500).json({ error: 'Failed to get posts' });
    }
  }

  /**
   * Get single post by ID
   */
  async getPostById(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const post = await this.postService.getPostById(id);

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format post
      const formattedPost = await this.formatPostResponse(
        post,
        userId || undefined
      );

      return res.json(formattedPost);
    } catch (error) {
      console.error('Error getting post:', error);
      return res.status(500).json({ error: 'Failed to get post' });
    }
  }

  /**
   * Get posts by username
   */
  async getPostsByUsername(
    req: RequestWithUser,
    res: Response
  ): Promise<Response> {
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

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format posts
      const formattedPosts = await Promise.all(
        posts.map(post => this.formatPostResponse(post, userId || undefined))
      );

      return res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      console.error('Error getting posts by username:', error);
      return res.status(500).json({ error: 'Failed to get posts' });
    }
  }

  /**
   * Update post
   */
  async updatePost(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';
      const { content, sensitive, contentWarning } = req.body;

      const post = await this.postService.updatePost(id, userId, {
        content,
        username: '', // Not used for update
        sensitive: sensitive === 'true',
        contentWarning,
      });

      if (!post) {
        return res
          .status(404)
          .json({ error: 'Post not found or not authorized' });
      }

      // Format post
      const formattedPost = await this.formatPostResponse(post, userId);

      return res.json(formattedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      return res.status(500).json({ error: 'Failed to update post' });
    }
  }

  /**
   * Delete post
   */
  async deletePost(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';

      const deleted = await this.postService.deletePost(id, userId);

      if (!deleted) {
        return res
          .status(404)
          .json({ error: 'Post not found or not authorized' });
      }

      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  /**
   * Like a post
   */
  async likePost(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';

      const liked = await this.postService.likePost(id, userId);

      if (!liked) {
        return res
          .status(400)
          .json({ error: 'Post already liked or not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error liking post:', error);
      return res.status(500).json({ error: 'Failed to like post' });
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(req: RequestWithUser, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';

      const unliked = await this.postService.unlikePost(id, userId);

      if (!unliked) {
        return res.status(400).json({ error: 'Post not liked or not found' });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error unliking post:', error);
      return res.status(500).json({ error: 'Failed to unlike post' });
    }
  }
}
