import express, { Request, Response, Router } from "express";
import path from "path";
import { ActorsController } from "../controllers/actorsController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";
import { UploadService } from "../../media/services/upload.service";

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const actorsController = new ActorsController();
  const { uploadService } = serviceContainer;

  // Configure image upload middleware with UploadService
  const imageUpload = uploadService.configureImageUploadMiddleware({
    fileSizeLimitMB: 5 // 5MB limit
  });

  // Search actors
  router.get("/search", (req: Request, res: Response) => {
    return actorsController.searchActors(req, res);
  });

  // Create new actor
  router.post("/", (req: Request, res: Response) => {
    imageUpload.single("avatarFile")(req as any, res as any, async (err) => {
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
    imageUpload.single("avatarFile")(req as any, res as any, async (err) => {
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

// Keep the old signature for backwards compatibility during transition
export function configureActorRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    actorService: null,
    postService: null,
    uploadService: new UploadService()
  } as unknown as ServiceContainer;
  
  return configureActorRoutes(serviceContainer);
}