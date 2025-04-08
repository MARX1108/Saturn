import express, { Request, Response, Router } from "express";
import { Db } from "mongodb";
import { MediaController } from "../controllers/media.controller";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure media routes with dependency injection
 */
export function configureMediaRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const { mediaService, uploadService } = serviceContainer;
  
  // Create controller with injected service
  const mediaController = new MediaController(mediaService);

  // Define routes
  router.post("/upload", (req: Request, res: Response) => 
    mediaController.uploadMedia(req, res)
  );
  
  router.get("/:id", (req: Request, res: Response) => 
    mediaController.getMedia(req, res)
  );
  
  router.delete("/:id", (req: Request, res: Response) => 
    mediaController.deleteMedia(req, res)
  );

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configureMediaRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    getService: (name: string) => {
      if (name === 'mediaService') {
        // Return a minimal implementation to keep things working
        return {};
      }
      return null;
    }
  } as unknown as ServiceContainer;
  
  return configureMediaRoutes(serviceContainer);
}

export default configureMediaRoutes;