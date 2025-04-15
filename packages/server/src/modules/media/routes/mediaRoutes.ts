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

  // Define routes with explicit RequestHandler types
  const uploadMediaHandler: RequestHandler = async (req, res, next) => {
    try {
      await mediaController.uploadMedia(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.post('/upload', uploadMediaHandler);

  const getMediaHandler: RequestHandler = async (req, res, next) => {
    try {
      await mediaController.getMedia(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.get('/:id', getMediaHandler);

  const deleteMediaHandler: RequestHandler = async (req, res, next) => {
    try {
      await mediaController.deleteMedia(req, res);
    } catch (error) {
      next(error);
    }
  };
  router.delete('/:id', deleteMediaHandler);

  return router;
}

export default configureMediaRoutes;
