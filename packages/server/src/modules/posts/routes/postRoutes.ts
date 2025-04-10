import express, { Request, Response, Router, NextFunction, RequestHandler } from "express";
import { PostsController } from "../controllers/postsController";
import { authenticateToken } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";

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

  // Create a new post - define as RequestHandler and use type assertion
  const createPostHandler: RequestHandler = (req, res, next) => {
    const upload = mediaUpload.array("attachments");
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      postsController.createPost(req as any, res)
        .catch(error => next(error));
    });
  };
  router.post("/", authenticateToken as any, createPostHandler);

  // Get feed (public timeline) - define as RequestHandler and use type assertion
  const getFeedHandler: RequestHandler = (req, res, next) => {
    postsController.getFeed(req as any, res)
      .catch(error => next(error));
  };
  router.get("/", getFeedHandler);

  // Get single post by ID - define as RequestHandler and use type assertion
  const getPostByIdHandler: RequestHandler = (req, res, next) => {
    postsController.getPostById(req as any, res)
      .catch(error => next(error));
  };
  router.get("/:id", getPostByIdHandler);

  // Update post - define as RequestHandler and use type assertion
  const updatePostHandler: RequestHandler = (req, res, next) => {
    postsController.updatePost(req as any, res)
      .catch(error => next(error));
  };
  router.put("/:id", authenticateToken as any, updatePostHandler);

  // Delete post - define as RequestHandler and use type assertion
  const deletePostHandler: RequestHandler = (req, res, next) => {
    postsController.deletePost(req as any, res)
      .catch(error => next(error));
  };
  router.delete("/:id", authenticateToken as any, deletePostHandler);

  // Like a post - define as RequestHandler and use type assertion
  const likePostHandler: RequestHandler = (req, res, next) => {
    postsController.likePost(req as any, res)
      .catch(error => next(error));
  };
  router.post("/:id/like", authenticateToken as any, likePostHandler);

  // Unlike a post - define as RequestHandler and use type assertion
  const unlikePostHandler: RequestHandler = (req, res, next) => {
    postsController.unlikePost(req as any, res)
      .catch(error => next(error));
  };
  router.post("/:id/unlike", authenticateToken as any, unlikePostHandler);

  return router;
}
