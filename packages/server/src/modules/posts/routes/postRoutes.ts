import express, { Request, Response, Router } from "express";
import path from "path";
import { Db } from "mongodb";
import { PostsController } from "../controllers/postsController";
import { authenticateToken } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";
import { UploadService } from "../../media/services/upload.service";

/**
 * Configure post routes with the controller
 */
export function configurePostRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const { postService, actorService, uploadService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";
  
  // Create controller with injected dependencies
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain
  );
  
  // Configure media upload middleware with UploadService
  const mediaUpload = uploadService.configureMediaUploadMiddleware({
    fileSizeLimitMB: 10, // 10MB limit
    allowedTypes: ["image/", "video/", "audio/"]
  });

  // Create a new post
  router.post("/", authenticateToken, (req: Request, res: Response) => {
    mediaUpload.array("attachments")(req as any, res as any, async (err) => {
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
    actorService: null,
    postService: null,
    uploadService: new UploadService()
  } as unknown as ServiceContainer;
  
  return configurePostRoutes(serviceContainer);
}