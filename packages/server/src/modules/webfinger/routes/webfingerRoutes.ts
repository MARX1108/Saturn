import express, { Request, Response, Router, NextFunction } from 'express';
import { WebFingerController } from '../controllers/webfingerController';
import { ServiceContainer } from '../../../utils/container';

/**
 * Configure WebFinger routes with the controller
 */
export default function configureWebFingerRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { actorService, webfingerService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';

  // Create controller with injected dependencies
  const webFingerController = new WebFingerController(
    actorService,
    webfingerService,
    domain
  );

  // WebFinger endpoint for actor discovery
  router.get(
    '/.well-known/webfinger',
    (req: Request, res: Response, next: NextFunction) => {
      webFingerController.getResource(req, res).catch(next);
    }
  );

  return router;
}
