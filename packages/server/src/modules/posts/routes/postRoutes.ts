import express, { Request, Response } from "express";
import { Db } from "mongodb";
import multer from "multer";
import path from "path";
import fs from "fs";
import { PostsController } from "../controllers/postsController";
import { authenticateToken } from "../../../middleware/auth";

/**
 * Configure post routes with the controller
 */
export function configurePostRoutes(db: Db, domain: string) {
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

  // Middleware to inject db and domain into app for controller access
  router.use((req, res, next) => {
    req.app.set("db", db);
    req.app.set("domain", domain);
    next();
  });

  // Create a new post
  router.post("/posts", authenticateToken, (req: Request, res: Response) => {
    upload.array("attachments")(req as any, res as any, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return postsController.createPost(req, res);
    });
  });

  // Get feed (public timeline)
  router.get("/posts", (req: Request, res: Response) => {
    return postsController.getFeed(req, res);
  });

  // Get single post by ID
  router.get("/posts/:id", (req: Request, res: Response) => {
    return postsController.getPostById(req, res);
  });

  // Get posts by username - route moved to a more relevant path
  router.get("/actors/:username/posts", (req: Request, res: Response) => {
    return postsController.getPostsByUsername(req, res);
  });

  // Update post
  router.put("/posts/:id", authenticateToken, (req: Request, res: Response) => {
    return postsController.updatePost(req, res);
  });

  // Delete post
  router.delete("/posts/:id", authenticateToken, (req: Request, res: Response) => {
    return postsController.deletePost(req, res);
  });

  // Like a post
  router.post("/posts/:id/like", authenticateToken, (req: Request, res: Response) => {
    return postsController.likePost(req, res);
  });

  // Unlike a post
  router.post("/posts/:id/unlike", authenticateToken, (req: Request, res: Response) => {
    return postsController.unlikePost(req, res);
  });

  return router;
}