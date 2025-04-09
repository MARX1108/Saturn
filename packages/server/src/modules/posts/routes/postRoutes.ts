import express, { Request, Response, Router, NextFunction } from "express";
import _path from "path";
import { Db as _Db } from "mongodb";
import multer from "multer";
import { PostsController } from "../controllers/postsController";
import { authenticateToken } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";
import { UploadService as _UploadService } from "../../media/services/upload.service";

/**
 * Configure post routes with the controller
 */
export function configurePostRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { postService, actorService, uploadService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";

  // Create controller with injected dependencies
  const postsController = new PostsController(
    postService,
    actorService,
    uploadService,
    domain,
  );

  // Configure media upload middleware with UploadService
  const mediaUpload = uploadService.configureMediaUploadMiddleware({
    fileSizeLimitMB: 10, // 10MB limit
    allowedTypes: ["image/", "video/", "audio/"],
  });

  // Create a new post
  router.post("/", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
    const upload = mediaUpload.array("attachments");
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      postsController.createPost(req, res)
        .catch(error => next(error));
    });
  });

  // Get feed (public timeline)
  router.get("/", (req: Request, res: Response, next: NextFunction) => {
    postsController.getFeed(req, res)
      .catch(error => next(error));
  });

  // Get single post by ID
  router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    postsController.getPostById(req, res)
      .catch(error => next(error));
  });

  // Update post
  router.put("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
    postsController.updatePost(req, res)
      .catch(error => next(error));
  });

  // Delete post
  router.delete("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
    postsController.deletePost(req, res)
      .catch(error => next(error));
  });

  // Like a post
  router.post("/:id/like", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
    postsController.likePost(req, res)
      .catch(error => next(error));
  });

  // Unlike a post
  router.post(
    "/:id/unlike",
    authenticateToken,
    (req: Request, res: Response, next: NextFunction) => {
      postsController.unlikePost(req, res)
        .catch(error => next(error));
    },
  );

  return router;
}
