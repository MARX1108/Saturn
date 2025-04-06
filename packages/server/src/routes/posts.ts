import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Db, ObjectId } from "mongodb";
import { ActorService } from "../services/actorService";
import { authenticateToken } from "../middleware/auth";
import { Attachment, PostResponse, Post } from "../types/post";
import { serviceMiddleware } from "../middleware/serviceMiddleware";

const router = express.Router();

// Apply serviceMiddleware to inject services into req.services
router.use(serviceMiddleware);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images, videos, etc.
    const allowedTypes = ["image/", "video/", "audio/"];
    const isAllowed = allowedTypes.some((type) =>
      file.mimetype.startsWith(type)
    );
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only images, videos and audio files are allowed"));
    }
  },
});

// Helper function to convert post to response format
async function formatPostResponse(
  post: Post,
  actorService: ActorService,
  userId?: string
): Promise<PostResponse> {
  const actor = await actorService.getActorById(post.actorId.toString());

  const formattedPost: PostResponse = {
    id: post._id.toString(),
    content: post.content,
    createdAt: post.createdAt,
    author: {
      id: post.actorId.toString(),
      username: actor?.preferredUsername || "unknown",
      displayName: actor?.name || actor?.preferredUsername || "Unknown User",
      avatarUrl: actor?.icon?.url || "/default-avatar.png",
    },
    sensitive: post.sensitive,
    contentWarning: post.contentWarning,
    attachments: post.attachments || [],
    likes: post.likes || 0,
    replies: post.replies || 0,
    reposts: post.reposts || 0,
    // Add liked property if we have a logged in user
    liked: false, // TODO: Implement proper like check
  };

  // Check if the post is liked by the current user
  if (userId && post.likedBy?.includes(userId)) {
    formattedPost.liked = true;
  }

  return formattedPost;
}

// Create a new post
router.post("/posts", authenticateToken, (req: Request, res: Response) => {
  upload.array("attachments")(req as any, res as any, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Get services from the service container
      const { actorService, postService } = req.services;

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
            url: `https://${req.app.get("domain")}/media/${fileName}`,
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
      const formattedPost = await formatPostResponse(
        post,
        actorService,
        userId
      );

      return res.status(201).json(formattedPost);
    } catch (error) {
      console.error("Error creating post:", error);
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to create post" });
    }
  });
});

// Get feed (public timeline)
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const { actorService, postService } = req.services;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { posts, hasMore } = await postService.getFeed(page, limit);

    // Get user ID from token if authenticated
    const userId = req.user?.id;

    // Format posts
    const formattedPosts = await Promise.all(
      posts.map((post) => formatPostResponse(post, actorService, userId))
    );

    return res.json({
      posts: formattedPosts,
      hasMore,
    });
  } catch (error) {
    console.error("Error getting posts:", error);
    console.error("Error details:", error);
    return res.status(500).json({ error: "Failed to get posts" });
  }
});

// Get single post by ID
router.get("/posts/:id", async (req: Request, res: Response) => {
  try {
    const { actorService, postService } = req.services;

    const { id } = req.params;
    const post = await postService.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Get user ID from token if authenticated
    const userId = req.user?.id;

    // Format post
    const formattedPost = await formatPostResponse(post, actorService, userId);

    return res.json(formattedPost);
  } catch (error) {
    console.error("Error getting post:", error);
    console.error("Error details:", error);
    return res.status(500).json({ error: "Failed to get post" });
  }
});

// Get posts by username
router.get("/users/:username/posts", async (req: Request, res: Response) => {
  try {
    const { actorService, postService } = req.services;

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
      posts.map((post) => formatPostResponse(post, actorService, userId))
    );

    return res.json({
      posts: formattedPosts,
      hasMore,
    });
  } catch (error) {
    console.error("Error getting posts by username:", error);
    console.error("Error details:", error);
    return res.status(500).json({ error: "Failed to get posts" });
  }
});

// Update post
router.put(
  "/posts/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { actorService, postService } = req.services;

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
      const formattedPost = await formatPostResponse(
        post,
        actorService,
        userId
      );

      return res.json(formattedPost);
    } catch (error) {
      console.error("Error updating post:", error);
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to update post" });
    }
  }
);

// Delete post
router.delete(
  "/posts/:id",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postService } = req.services;

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
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to delete post" });
    }
  }
);

// Like a post
router.post(
  "/posts/:id/like",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postService } = req.services;

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
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to like post" });
    }
  }
);

// Unlike a post
router.post(
  "/posts/:id/unlike",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { postService } = req.services;

      const { id } = req.params;
      const userId = req.user.id;

      const unliked = await postService.unlikePost(id, userId);

      if (!unliked) {
        return res.status(400).json({ error: "Post not liked or not found" });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error unliking post:", error);
      console.error("Error details:", error);
      return res.status(500).json({ error: "Failed to unlike post" });
    }
  }
);

export default router;
