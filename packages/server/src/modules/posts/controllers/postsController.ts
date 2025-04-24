import { Request, Response, NextFunction } from 'express';
import { PostService } from '@/modules/posts/services/postService';
import { ActorService } from '@/modules/actors/services/actorService';
import { UploadService } from '@/modules/media/services/upload.service';
import { AppError, ErrorType } from '@/utils/errors';
import { Post, Attachment } from '@/modules/posts/models/post';
import { Actor } from '@/modules/actors/models/actor';
import { ObjectId } from 'mongodb';
import {
  CreatePostData,
  UpdatePostData,
} from '@/modules/posts/services/postService';

// --- Define DTOs for Request Validation ---
// Define outside the class

// DTO for creating a post

// DTO for updating a post (adjust properties as needed)

// Define response DTO (can be refined further)
interface PostResponseDTO {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    preferredUsername: string;
    displayName?: string;
    iconUrl?: string;
  };
  published: string;
  sensitive: boolean;
  summary?: string;
  attachments?: Attachment[];
  likes: number;
  likedByUser: boolean;
  shares: number;
  sharedByUser: boolean;
  replyCount: number;
  visibility: 'public' | 'followers' | 'unlisted' | 'direct';
  url: string;
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
    requestingActorId?: string // Optional ID of the user making the request
  ): Promise<PostResponseDTO> {
    // Use defined DTO
    if (!post.actorId) {
      throw new AppError(
        'Post author information is missing.',
        500,
        ErrorType.INTERNAL_SERVER_ERROR
      );
    }

    // Fetch author details if not already populated
    let author: Pick<
      Actor,
      'id' | 'username' | 'preferredUsername' | 'displayName' | 'icon' | 'name'
    > | null;
    if (post.actor && post.actor.id) {
      // Use pre-populated actor summary if available
      author = post.actor;
    } else {
      author = await this.actorService.getActorById(post.actorId);
    }

    if (!author) {
      throw new AppError(
        'Author not found for post.',
        404,
        ErrorType.NOT_FOUND
      );
    }

    // Convert potential ObjectId to string for comparison
    const reqActorIdStr = requestingActorId
      ? new ObjectId(requestingActorId).toHexString()
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
  async createPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?._id) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      const actorId = req.user._id;

      // --- Safely extract and validate data from req.body ---
      const body = req.body as Record<string, unknown>; // Assert body as Record<string, unknown> first

      // Validate required content
      if (typeof body.content !== 'string' || body.content.trim() === '') {
        throw new AppError(
          'Post content must be a non-empty string',
          400,
          ErrorType.BAD_REQUEST
        );
      }
      const content: string = body.content;

      // Validate optional fields if they exist
      const visibility =
        typeof body.visibility === 'string'
          ? (body.visibility as CreatePostData['visibility'])
          : undefined;
      const sensitive =
        typeof body.sensitive === 'boolean' ? body.sensitive : undefined;
      const summary =
        typeof body.summary === 'string' ? body.summary : undefined;

      // Basic validation for attachments (ensure it's an array if present)
      // More specific validation (checking each element's structure) might be needed
      const attachmentsFromBody: Attachment[] | undefined = Array.isArray(
        body.attachments
      )
        ? (body.attachments as Attachment[])
        : undefined;

      // --- Construct postData with validated types ---
      const postData: CreatePostData = {
        content, // Now guaranteed to be a string
        visibility, // Typed or undefined
        sensitive, // Typed or undefined
        summary, // Typed or undefined
        attachments: attachmentsFromBody, // Typed array or undefined
        actorId,
      };

      // Original content check is now handled above
      // if (!postData.content) { ... }

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
  async getFeed(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401, // Unauthorized
          ErrorType.AUTHENTICATION
        );
      }
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
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
  async getPostById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const postId = req.params.id;
      const post = await this.postService.getPostById(postId);
      if (!post) {
        throw new AppError('Post not found', 404, ErrorType.NOT_FOUND);
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

      // Call the service method to get posts by username
      const result = await this.postService.getPostsByUsername(username, {
        limit,
        offset,
      });

      // Format posts
      const formattedPosts = await Promise.all(
        result.posts.map((post: Post) =>
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
  async updatePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?._id) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      const actorId = req.user._id;
      const postId = req.params.id;

      // --- Safely extract and validate data from req.body ---
      const body = req.body as Record<string, unknown>; // Assert body as Record<string, unknown> first

      // Validate optional fields if they exist
      // Note: For update, even content is optional
      const content =
        typeof body.content === 'string' ? body.content : undefined;
      const visibility =
        typeof body.visibility === 'string'
          ? (body.visibility as UpdatePostData['visibility'])
          : undefined;
      const sensitive =
        typeof body.sensitive === 'boolean' ? body.sensitive : undefined;
      const summary =
        typeof body.summary === 'string' ? body.summary : undefined;
      const attachments = Array.isArray(body.attachments)
        ? (body.attachments as Attachment[])
        : undefined;

      // Check if at least one field is provided for update
      if (
        content === undefined &&
        visibility === undefined &&
        sensitive === undefined &&
        summary === undefined &&
        attachments === undefined
      ) {
        throw new AppError(
          'No update data provided',
          400,
          ErrorType.BAD_REQUEST
        );
      }

      // Use imported UpdatePostData type
      const updateData: UpdatePostData = {
        content,
        visibility,
        sensitive,
        summary,
        attachments,
      };

      const updatedPost = await this.postService.updatePost(
        postId,
        actorId,
        updateData
      );
      if (!updatedPost) {
        throw new AppError(
          'Post not found or user not authorized',
          404,
          ErrorType.NOT_FOUND
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
  async deletePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user?._id) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;

      const success = await this.postService.deletePost(postId, actorId);

      if (!success) {
        throw new AppError(
          'Post not found or user not authorized',
          404,
          ErrorType.NOT_FOUND
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
      if (!req.user?._id) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;

      const liked = await this.postService.likePost(postId, actorId);

      if (!liked) {
        throw new AppError(
          'Post already liked or not found',
          400, // Bad Request
          ErrorType.VALIDATION // Or a different type?
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
      if (!req.user?._id) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorType.UNAUTHORIZED
        );
      }
      const postId = req.params.id;
      const actorId = req.user._id;

      const unliked = await this.postService.unlikePost(postId, actorId);

      if (!unliked) {
        throw new AppError(
          'Post not liked or not found',
          400, // Bad Request
          ErrorType.VALIDATION // Or a different type?
        );
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}
