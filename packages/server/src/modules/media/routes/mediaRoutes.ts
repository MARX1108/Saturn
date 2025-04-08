import express, { Request, Response, Router } from "express";
import { Db } from "mongodb";
import { MediaController } from "../controllers/media.controller";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure media routes with dependency injection
 */
export function configureMediaRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { mediaService, uploadService } = serviceContainer;

  // Create controller with injected service
  const mediaController = new MediaController(mediaService);

  // Define routes
  router.post("/upload", (req: Request, res: Response) =>
    mediaController.uploadMedia(req, res),
  );

  router.get("/:id", (req: Request, res: Response) =>
    mediaController.getMedia(req, res),
  );

  router.delete("/:id", (req: Request, res: Response) =>
    mediaController.deleteMedia(req, res),
  );

  return router;
}

export default configureMediaRoutes;
