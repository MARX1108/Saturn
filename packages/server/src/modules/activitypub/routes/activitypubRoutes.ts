import express, { Request, Response, Router, NextFunction } from 'express';
import { ActivityPubController } from '../controllers/activitypubController';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';

/**
 * Configure ActivityPub routes with the controller
 */
export function configureActivityPubRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { actorService, activityPubService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';

  // Create controller with injected dependencies
  const activityPubController = new ActivityPubController(
    actorService,
    activityPubService,
    domain
  );

  // Get ActivityPub actor profile (federated)
  router.get(
    '/users/:username',
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return activityPubController.getActor(req, res);
    })
  );

  // Actor inbox - where activities from other servers arrive
  router.post(
    '/users/:username/inbox',
    express.json(),
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return activityPubController.receiveActivity(req, res);
    })
  );

  // Actor outbox - collection of activities by this user
  router.get(
    '/users/:username/outbox',
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return activityPubController.getOutbox(req, res);
    })
  );

  return router;
}
