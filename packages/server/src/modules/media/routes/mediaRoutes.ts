import express, { Request, Response, Router, NextFunction } from 'express';
import { MediaController } from '../controllers/media.controller';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';

/**
 * Configure media routes with dependency injection
 */
export function configureMediaRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { mediaService, uploadService: _uploadService } = serviceContainer;

  // Create controller with injected service
  const mediaController = new MediaController(mediaService);

  // Upload media
  router.post(
    '/upload',
    wrapAsync((req: Request, res: Response, next: NextFunction) => {
      return mediaController.uploadMedia(req, res);
    })
  );

  // Get media by ID
  router.get(
    '/:id',
    wrapAsync((req: Request, res: Response, next: NextFunction) => {
      return mediaController.getMedia(req, res);
    })
  );

  // Delete media
  router.delete(
    '/:id',
    wrapAsync((req: Request, res: Response, next: NextFunction) => {
      return mediaController.deleteMedia(req, res);
    })
  );

  return router;
}

export default configureMediaRoutes;
