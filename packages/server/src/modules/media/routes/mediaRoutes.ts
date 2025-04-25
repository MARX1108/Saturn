import express, { Request, Response, Router, NextFunction } from 'express';
import { MediaController } from '../controllers/media.controller';
import { ServiceContainer } from '../../../utils/container';
import { wrapAsync } from '../../../utils/routeHandler';
import { mediaUploadRateLimiter } from '../../../middleware/rateLimiter';
import { authenticate } from '../../../middleware/auth';

/**
 * Configure media routes with dependency injection
 */
export function configureMediaRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const {
    mediaService,
    uploadService: _uploadService,
    authService,
  } = serviceContainer;

  // Create controller with injected service
  const mediaController = new MediaController(mediaService);

  // Upload media - apply rate limiting to prevent abuse
  router.post(
    '/upload',
    authenticate(authService), // Ensure users are authenticated
    mediaUploadRateLimiter, // Apply rate limiting to uploads
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      return mediaController.uploadMedia(req, res);
    })
  );

  // Get media by ID
  router.get(
    '/:id',
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      return mediaController.getMedia(req, res);
    })
  );

  // Delete media
  router.delete(
    '/:id',
    authenticate(authService), // Ensure users are authenticated
    wrapAsync(async (req: Request, res: Response, next: NextFunction) => {
      return mediaController.deleteMedia(req, res);
    })
  );

  return router;
}

export default configureMediaRoutes;
