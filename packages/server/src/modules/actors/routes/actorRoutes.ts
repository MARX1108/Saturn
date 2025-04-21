import express, { Request, Response, Router, NextFunction } from 'express';
import { ActorsController } from '../controllers/actorsController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import multer from 'multer';

/**
 * Configure actor routes with the controller
 */
export default function configureActorRoutes(
  serviceContainer: ServiceContainer
): Router {
  const router = express.Router();
  const { actorService, uploadService, postService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';

  // Create controller with injected dependencies
  const actorsController = new ActorsController(
    actorService,
    uploadService,
    postService,
    domain
  );

  // Configure image upload middleware with UploadService
  // Temporarily commented out to debug setup
  // const imageUpload = uploadService.configureImageUploadMiddleware({
  //   fileSizeLimitMB: 5, // 5MB limit
  // });

  // Search actors
  router.get('/search', (req: Request, res: Response, next: NextFunction) => {
    actorsController.searchActors(req, res).catch(next);
  });

  // Create new actor
  router.post('/', (req: Request, res: Response, next: NextFunction) => {
    actorsController.createActor(req, res, next).catch(next);
  });

  // Get actor posts
  router.get(
    '/:username/posts',
    (req: Request, res: Response, next: NextFunction) => {
      actorsController.getActorPosts(req, res, next).catch(next);
    }
  );

  // Get actor by username
  router.get(
    '/:username',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.getActorByUsername(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Update actor
  router.put(
    '/:id',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.updateActor(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  );

  // Delete actor
  router.delete(
    '/:id',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.deleteActor(req, res, next);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
