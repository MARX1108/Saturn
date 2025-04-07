import express, { Request, Response, Router } from "express";
import { Db } from "mongodb";
import { WebFingerController } from "../controllers/webfingerController";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure WebFinger routes with the controller
 */
export function configureWebFingerRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const webFingerController = new WebFingerController();
  const actorService = serviceContainer.getService('actorService');

  // WebFinger endpoint for actor discovery
  router.get("/.well-known/webfinger", (req: Request, res: Response) => {
    return webFingerController.getResource(req, res);
  });

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configureWebFingerRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    getService: (name: string) => {
      if (name === 'actorService') {
        // Return a minimal implementation to keep things working
        return {};
      }
      return null;
    }
  } as ServiceContainer;
  
  return configureWebFingerRoutes(serviceContainer);
}