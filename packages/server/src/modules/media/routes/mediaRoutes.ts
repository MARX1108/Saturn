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

  // Media routes are now configured properly

  // Upload media - apply rate limiting to prevent abuse
  // NOTE: This route must come BEFORE /:id routes to avoid conflicts
  router.post(
    '/upload',
    authenticate(authService), // Ensure users are authenticated
    mediaUploadRateLimiter, // Apply rate limiting to uploads
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return mediaController.uploadMedia(req, res);
    })
  );

  // Handle GET requests to /upload (common mistake)
  router.get('/upload', (req: Request, res: Response) => {
    res.status(405).json({
      error: 'Method Not Allowed. Use POST to upload media.',
      allowedMethods: ['POST'],
    });
  });

  // Get media by ID - comes after specific routes
  router.get(
    '/:id',
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return mediaController.getMedia(req, res);
    })
  );

  // Delete media - comes after specific routes
  router.delete(
    '/:id',
    authenticate(authService), // Ensure users are authenticated
    wrapAsync(async (req: Request, res: Response, _next: NextFunction) => {
      return mediaController.deleteMedia(req, res);
    })
  );

  return router;
}

export default configureMediaRoutes;
