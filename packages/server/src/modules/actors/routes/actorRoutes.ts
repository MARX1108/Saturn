import express, { Request, Response, Router, NextFunction, RequestHandler } from "express";
import _path from "path";
import { Db as _Db } from "mongodb";
import multer from "multer";
import { ActorsController } from "../controllers/actorsController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";
import { UploadService as _UploadService } from "../../media/services/upload.service";

// Reference the type declarations to ensure they're included in compilation
/// <reference path="../../../types/express.d.ts" />

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { actorService, uploadService } = serviceContainer;
  const domain = process.env.DOMAIN || "localhost:4000";

  // Create controller with injected dependencies
  const actorsController = new ActorsController(
    actorService,
    uploadService,
    domain,
  );

  // Configure image upload middleware with UploadService
  const imageUpload = uploadService.configureImageUploadMiddleware({
    fileSizeLimitMB: 5, // 5MB limit
  });

  // Search actors
  router.get("/search", actorsController.searchActors.bind(actorsController));

  // Create new actor
  router.post("/", (req: Request, res: Response, next: NextFunction) => {
    const upload = imageUpload.single("avatarFile");
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      actorsController.createActor(req, res)
        .catch(error => next(error));
    });
  });

  // Get actor by username
  router.get("/:username", actorsController.getActorByUsername.bind(actorsController));

  // Update actor - requires authentication
  router.put("/:username", auth, (req: Request, res: Response, next: NextFunction) => {
    const upload = imageUpload.single("avatarFile");
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      actorsController.updateActor(req, res)
        .catch(error => next(error));
    });
  });

  // Delete actor - requires authentication
  router.delete("/:username", auth, actorsController.deleteActor.bind(actorsController));

  return router;
}
