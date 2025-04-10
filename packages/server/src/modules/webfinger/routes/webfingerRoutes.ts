import express, { Request, Response, Router, RequestHandler } from "express";
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

  // WebFinger endpoint for actor discovery using explicit RequestHandler type and type assertion
  const getResourceHandler: RequestHandler = (req, res, next) => {
    webFingerController.getResource(req as any, res).catch(next);
  };
  
  router.get("/.well-known/webfinger", getResourceHandler);

  return router;
}
