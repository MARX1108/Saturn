import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { PostService } from "../services/postService";
import { ActorService } from "../../actors/services/actorService";
import { Attachment, PostResponse, Post } from "../models/post";

export class PostsController {
  /**
   * Helper function to convert post to response format
   */
  private async formatPostResponse(
    post: Post,
    actorService: ActorService,
    userId?: string
  ): Promise<PostResponse> {
    const actor = await actorService.getActorById(post.actor.id);
    const likedByUser = userId
      ? post.likes?.includes(userId) || false
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
  async createPost(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);
      const actorService = new ActorService(db, domain);

      // Get user from token
      const userId = req.user.id;
      const actor = await actorService.getActorById(userId);

      if (!actor) {
        return res.status(404).json({ error: "User not found" });
      }

      const { content, sensitive, contentWarning } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!content && (!files || files.length === 0)) {
        return res
          .status(400)
          .json({ error: "Post must contain content or attachments" });
      }

      // Process attachments
      const attachments: Attachment[] = [];

      if (files && files.length > 0) {
        // Move files to public directory
        const publicDir = path.join(process.cwd(), "public", "media");
        fs.mkdirSync(publicDir, { recursive: true });

        for (const file of files) {
          const fileName = `${Date.now()}-${file.originalname.replace(
            /\s/g,
            "_"
          )}`;
          const finalPath = path.join(publicDir, fileName);

          fs.renameSync(file.path, finalPath);

          attachments.push({
            url: `https://${domain}/media/${fileName}`,
            type: file.mimetype.startsWith("image/")
              ? "Image"
              : file.mimetype.startsWith("video/")
              ? "Video"
              : "Document",
            mediaType: file.mimetype,
          });
        }
      }

      // Create post
      const post = await postService.createPost(
        {
          content: content || "",
          username: actor.preferredUsername,
          sensitive: sensitive === "true",
          contentWarning: contentWarning || "",
          attachments,
        },
        userId
      );

      // Format response
      const formattedPost = await this.formatPostResponse(
        post,
        actorService,
        userId
      );

      return res.status(201).json(formattedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  }

  /**
   * Get feed (public timeline)
   */
  async getFeed(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);
      const actorService = new ActorService(db, domain);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { posts, hasMore } = await postService.getFeed(page, limit);

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format posts
      const formattedPosts = await Promise.all(
        posts.map((post) => this.formatPostResponse(post, actorService, userId))
      );

      return res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      console.error("Error getting posts:", error);
      return res.status(500).json({ error: "Failed to get posts" });
    }
  }

  /**
   * Get single post by ID
   */
  async getPostById(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);
      const actorService = new ActorService(db, domain);

      const { id } = req.params;
      const post = await postService.getPostById(id);

      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format post
      const formattedPost = await this.formatPostResponse(post, actorService, userId);

      return res.json(formattedPost);
    } catch (error) {
      console.error("Error getting post:", error);
      return res.status(500).json({ error: "Failed to get post" });
    }
  }

  /**
   * Get posts by username
   */
  async getPostsByUsername(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);
      const actorService = new ActorService(db, domain);

      const { username } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const { posts, hasMore } = await postService.getPostsByUsername(
        username,
        page,
        limit
      );

      // Get user ID from token if authenticated
      const userId = req.user?.id;

      // Format posts
      const formattedPosts = await Promise.all(
        posts.map((post) => this.formatPostResponse(post, actorService, userId))
      );

      return res.json({
        posts: formattedPosts,
        hasMore,
      });
    } catch (error) {
      console.error("Error getting posts by username:", error);
      return res.status(500).json({ error: "Failed to get posts" });
    }
  }

  /**
   * Update post
   */
  async updatePost(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);
      const actorService = new ActorService(db, domain);

      const { id } = req.params;
      const userId = req.user.id;
      const { content, sensitive, contentWarning } = req.body;

      const post = await postService.updatePost(id, userId, {
        content,
        username: "", // Not used for update
        sensitive: sensitive === "true",
        contentWarning,
      });

      if (!post) {
        return res
          .status(404)
          .json({ error: "Post not found or not authorized" });
      }

      // Format post
      const formattedPost = await this.formatPostResponse(
        post,
        actorService,
        userId
      );

      return res.json(formattedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({ error: "Failed to update post" });
    }
  }

  /**
   * Delete post
   */
  async deletePost(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);

      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await postService.deletePost(id, userId);

      if (!deleted) {
        return res
          .status(404)
          .json({ error: "Post not found or not authorized" });
      }

      return res.status(204).end();
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({ error: "Failed to delete post" });
    }
  }

  /**
   * Like a post
   */
  async likePost(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);

      const { id } = req.params;
      const userId = req.user.id;

      const liked = await postService.likePost(id, userId);

      if (!liked) {
        return res
          .status(400)
          .json({ error: "Post already liked or not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error liking post:", error);
      return res.status(500).json({ error: "Failed to like post" });
    }
  }

  /**
   * Unlike a post
   */
  async unlikePost(req: Request, res: Response): Promise<Response> {
    try {
      const db = req.app.get("db");
      const domain = req.app.get("domain");
      const postService = new PostService(db, domain);

      const { id } = req.params;
      const userId = req.user.id;

      const unliked = await postService.unlikePost(id, userId);

      if (!unliked) {
        return res.status(400).json({ error: "Post not liked or not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      return res.status(500).json({ error: "Failed to unlike post" });
    }
  }
}