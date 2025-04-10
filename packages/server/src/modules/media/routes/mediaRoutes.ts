import express, { Request, Response, Router, NextFunction, RequestHandler } from "express";
import { MediaController } from "../controllers/media.controller";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure media routes with dependency injection
 */
export function configureMediaRoutes(
  serviceContainer: ServiceContainer,
): Router {
  const router = express.Router();
  const { mediaService, uploadService: _uploadService } = serviceContainer;

  // Create controller with injected service
  const mediaController = new MediaController(mediaService);

  // Define routes with explicit RequestHandler types and type assertions
  const uploadMediaHandler: RequestHandler = (req, res, next) => {
    mediaController.uploadMedia(req as any, res).catch(next);
  };
  router.post("/upload", uploadMediaHandler);

  const getMediaHandler: RequestHandler = (req, res, next) => {
    mediaController.getMedia(req as any, res).catch(next);
  };
  router.get("/:id", getMediaHandler);

  const deleteMediaHandler: RequestHandler = (req, res, next) => {
    mediaController.deleteMedia(req as any, res).catch(next);
  };
  router.delete("/:id", deleteMediaHandler);

  return router;
}

export default configureMediaRoutes;
