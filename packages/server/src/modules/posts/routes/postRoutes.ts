import express, { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PostsController } from "../controllers/postsController";
import { authenticateToken } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure post routes with the controller
 */
export function configurePostRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const postsController = new PostsController();
  
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

  // Create a new post
  router.post("/", authenticateToken, (req: Request, res: Response) => {
    upload.array("attachments")(req as any, res as any, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return postsController.createPost(req, res);
    });
  });

  // Get feed (public timeline)
  router.get("/", (req: Request, res: Response) => {
    return postsController.getFeed(req, res);
  });

  // Get single post by ID
  router.get("/:id", (req: Request, res: Response) => {
    return postsController.getPostById(req, res);
  });

  // Update post
  router.put("/:id", authenticateToken, (req: Request, res: Response) => {
    return postsController.updatePost(req, res);
  });

  // Delete post
  router.delete("/:id", authenticateToken, (req: Request, res: Response) => {
    return postsController.deletePost(req, res);
  });

  // Like a post
  router.post("/:id/like", authenticateToken, (req: Request, res: Response) => {
    return postsController.likePost(req, res);
  });

  // Unlike a post
  router.post("/:id/unlike", authenticateToken, (req: Request, res: Response) => {
    return postsController.unlikePost(req, res);
  });

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configurePostRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    getService: (name: string) => {
      if (name === 'postService') {
        // Return a minimal implementation to keep things working
        return {};
      }
      return null;
    }
  } as ServiceContainer;
  
  return configurePostRoutes(serviceContainer);
}