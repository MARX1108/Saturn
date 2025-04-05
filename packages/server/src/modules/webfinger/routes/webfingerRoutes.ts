import express, { Request, Response } from "express";
import { Db } from "mongodb";
import { WebFingerController } from "../controllers/webfingerController";

/**
 * Configure WebFinger routes with the controller
 */
export function configureWebFingerRoutes(db: Db, domain: string) {
  const router = express.Router();
  const webFingerController = new WebFingerController();

  // Middleware to inject db and domain into app for controller access
  router.use((req, res, next) => {
    req.app.set("db", db);
    req.app.set("domain", domain);
    next();
  });

  // WebFinger endpoint for actor discovery
  router.get("/.well-known/webfinger", (req: Request, res: Response) => {
    return webFingerController.getResource(req, res);
  });

  return router;
}