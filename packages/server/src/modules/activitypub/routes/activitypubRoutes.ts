import express, { Request, Response, Router } from "express";
import { Db } from "mongodb";
import { ActivityPubController } from "../controllers/activitypubController";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure ActivityPub routes with the controller
 */
export function configureActivityPubRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const activityPubController = new ActivityPubController();
  const actorService = serviceContainer.getService('actorService');

  // Get ActivityPub actor profile (federated)
  router.get("/users/:username", (req: Request, res: Response) => {
    return activityPubController.getActor(req, res);
  });

  // Actor inbox - where activities from other servers arrive
  router.post("/users/:username/inbox", express.json(), (req: Request, res: Response) => {
    return activityPubController.receiveActivity(req, res);
  });

  // Actor outbox - collection of activities by this user
  router.get("/users/:username/outbox", (req: Request, res: Response) => {
    return activityPubController.getOutbox(req, res);
  });

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configureActivityPubRoutesLegacy(db: Db, domain: string): Router {
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
  
  return configureActivityPubRoutes(serviceContainer);
}