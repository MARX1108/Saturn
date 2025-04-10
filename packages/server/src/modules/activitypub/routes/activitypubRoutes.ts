import express, { Request, Response, Router, NextFunction, RequestHandler } from "express";
import { ActivityPubController } from "../controllers/activitypubController";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure ActivityPub routes with the controller
 */
export function configureActivityPubRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { actorService, activityPubService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";

  // Create controller with injected dependencies
  const activityPubController = new ActivityPubController(
    actorService,
    activityPubService,
    domain,
  );

  // Get ActivityPub actor profile (federated) - define as RequestHandler with type assertion
  const getActorHandler: RequestHandler = (req, res, next) => {
    activityPubController.getActor(req as any, res).catch(next);
  };
  router.get("/users/:username", getActorHandler);

  // Actor inbox - where activities from other servers arrive - define as RequestHandler with type assertion
  const receiveActivityHandler: RequestHandler = (req, res, next) => {
    activityPubController.receiveActivity(req as any, res).catch(next);
  };
  router.post("/users/:username/inbox", express.json(), receiveActivityHandler);

  // Actor outbox - collection of activities by this user - define as RequestHandler with type assertion
  const getOutboxHandler: RequestHandler = (req, res, next) => {
    activityPubController.getOutbox(req as any, res).catch(next);
  };
  router.get("/users/:username/outbox", getOutboxHandler);

  return router;
}
