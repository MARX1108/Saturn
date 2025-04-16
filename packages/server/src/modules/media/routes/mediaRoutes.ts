import express, {
  Request,
  Response,
  Router,
  NextFunction,
  RequestHandler,
} from 'express';
import { MediaController } from '../controllers/media.controller';
import { ServiceContainer } from '../../../utils/container';

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
  router.post('/upload', (req: Request, res: Response, next: NextFunction) => {
    mediaController.uploadMedia(req, res).catch(next);
  });

  // Get media by ID
  router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
    mediaController.getMedia(req, res).catch(next);
  });

  // Delete media
  router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
    mediaController.deleteMedia(req, res).catch(next);
  });

  return router;
}

export default configureMediaRoutes;
