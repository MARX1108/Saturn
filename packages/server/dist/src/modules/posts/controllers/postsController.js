'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PostsController = void 0;
const path_1 = __importDefault(require('path'));
const fs_1 = __importDefault(require('fs'));
class PostsController {
  constructor(postService, actorService, uploadService, domain) {
    this.postService = postService;
    this.actorService = actorService;
    this.uploadService = uploadService;
    this.domain = domain;
  }
  /**
   * Helper function to convert post to response format
   */
  async formatPostResponse(post, userId) {
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
  async createPost(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const userId = req.user.id || '';
      const actor = await this.actorService.getActorById(userId);
      if (!actor) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { content, sensitive, contentWarning } = req.body;
      const files = req.files;
      if (!content && (!files || files.length === 0)) {
        return res
          .status(400)
          .json({ error: 'Post must contain content or attachments' });
      }
      // Process attachments
      const attachments = [];
      if (files && files.length > 0) {
        // Move files to public directory
        const publicDir = path_1.default.join(process.cwd(), 'public', 'media');
        fs_1.default.mkdirSync(publicDir, { recursive: true });
        for (const file of files) {
          const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
          const finalPath = path_1.default.join(publicDir, fileName);
          fs_1.default.renameSync(file.path, finalPath);
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
      return res.status(201).json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get feed (public timeline)
   */
  async getFeed(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const { posts, hasMore } = await this.postService.getFeed(page, limit);
      // Format posts
      const formattedPosts = await Promise.all(
        posts.map(post =>
          this.formatPostResponse(post, req.user?.id || undefined)
        )
      );
      return res.json({
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
  async getPostById(req, res, next) {
    try {
      const post = await this.postService.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      const formattedPost = await this.formatPostResponse(post, req.user?.id);
      return res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Get posts by username
   */
  async getPostsByUsername(req, res, next) {
    try {
      const { username } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      // Calculate offset from page and limit
      const offset = (page - 1) * limit;
      const result = await this.postService.getPostsByUsername(username, {
        limit,
        offset,
      });
      // Format posts
      const formattedPosts = await Promise.all(
        result.posts.map(post =>
          this.formatPostResponse(post, req.user?.id || undefined)
        )
      );
      // Calculate if there are more posts
      const hasMore = result.offset + result.posts.length < result.total;
      return res.json({
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
  async updatePost(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
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
        return res
          .status(404)
          .json({ error: 'Post not found or not authorized' });
      }
      // Format post
      const formattedPost = await this.formatPostResponse(post, userId);
      return res.json(formattedPost);
    } catch (error) {
      next(error);
    }
  }
  /**
   * Delete post
   */
  async deletePost(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const userId = req.user.id || '';
    const deleted = await this.postService.deletePost(id, userId);
    if (!deleted) {
      return res
        .status(404)
        .json({ error: 'Post not found or not authorized' });
    }
    return res.status(204).end();
  }
  /**
   * Like a post
   */
  async likePost(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const userId = req.user.id || '';
    const liked = await this.postService.likePost(id, userId);
    if (!liked) {
      return res.status(400).json({ error: 'Post already liked or not found' });
    }
    return res.status(200).json({ success: true });
  }
  /**
   * Unlike a post
   */
  async unlikePost(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const { id } = req.params;
    const userId = req.user.id || '';
    const unliked = await this.postService.unlikePost(id, userId);
    if (!unliked) {
      return res.status(400).json({ error: 'Post not liked or not found' });
    }
    return res.status(200).json({ success: true });
  }
}
exports.PostsController = PostsController;
