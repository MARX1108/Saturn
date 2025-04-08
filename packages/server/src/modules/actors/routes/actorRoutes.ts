import express, { Request, Response, Router } from "express";
import _path from "path";
import { Db as _Db } from "mongodb";
import multer from "multer";
import { ActorsController } from "../controllers/actorsController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";
import { UploadService as _UploadService } from "../../media/services/upload.service";

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { actorService, uploadService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";

  // Create controller with injected dependencies
  const actorsController = new ActorsController(
    actorService,
    uploadService,
    domain,
  );

  // Configure image upload middleware with UploadService
  const imageUpload = uploadService.configureImageUploadMiddleware({
    fileSizeLimitMB: 5, // 5MB limit
  });

  // Search actors
  router.get("/search", (req: Request, res: Response) => {
    return actorsController.searchActors(req, res);
  });

  // Create new actor
  router.post("/", (req: Request, res: Response) => {
    imageUpload.single("avatarFile")(req as express.Request, res as express.Response, async (err: multer.MulterError | Error | undefined) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return actorsController.createActor(req, res);
    });
  });

  // Get actor by username
  router.get("/:username", (req: Request, res: Response) => {
    return actorsController.getActorByUsername(req, res);
  });

  // Update actor - requires authentication
  router.put("/:username", auth, (req: Request, res: Response) => {
    imageUpload.single("avatarFile")(req as express.Request, res as express.Response, async (err: multer.MulterError | Error | undefined) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return actorsController.updateActor(req, res);
    });
  });

  // Delete actor - requires authentication
  router.delete("/:username", auth, (req: Request, res: Response) => {
    return actorsController.deleteActor(req, res);
  });

  return router;
}
