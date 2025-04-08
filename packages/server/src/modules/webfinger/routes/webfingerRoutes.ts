import express, { Request, Response, Router } from "express";
import { Db as _Db } from "mongodb";
import { WebFingerController } from "../controllers/webfingerController";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure WebFinger routes with the controller
 */
export function configureWebFingerRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { actorService, webfingerService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";

  // Create controller with injected dependencies
  const webFingerController = new WebFingerController(
    actorService,
    webfingerService,
    domain,
  );

  // WebFinger endpoint for actor discovery
  router.get("/.well-known/webfinger", (req: Request, res: Response) => {
    return webFingerController.getResource(req, res);
  });

  return router;
}
