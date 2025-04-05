import express, { Request, Response } from "express";
import { Db } from "mongodb";
import { ActivityPubController } from "../controllers/activitypubController";

/**
 * Configure ActivityPub routes with the controller
 */
export function configureActivityPubRoutes(db: Db, domain: string) {
  const router = express.Router();
  const activityPubController = new ActivityPubController();

  // Middleware to inject db and domain into app for controller access
  router.use((req, res, next) => {
    req.app.set("db", db);
    req.app.set("domain", domain);
    next();
  });

  // Get ActivityPub actor profile (federated)
  router.get("/users/:username", (req: Request, res: Response) => {
    return activityPubController.getActor(req, res);
  });

  return router;
}