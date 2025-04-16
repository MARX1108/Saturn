import express, { Request, Response, Router, NextFunction } from 'express';
import { ActivityPubController } from '../controllers/activitypubController';
import { ServiceContainer } from '../../../utils/container';

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
    (req: Request, res: Response, next: NextFunction) => {
      activityPubController.getActor(req, res).catch(next);
    }
  );

  // Actor inbox - where activities from other servers arrive
  router.post(
    '/users/:username/inbox',
    express.json(),
    (req: Request, res: Response, next: NextFunction) => {
      activityPubController.receiveActivity(req, res).catch(next);
    }
  );

  // Actor outbox - collection of activities by this user
  router.get(
    '/users/:username/outbox',
    (req: Request, res: Response, next: NextFunction) => {
      activityPubController.getOutbox(req, res).catch(next);
    }
  );

  return router;
}
