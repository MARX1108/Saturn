/* eslint-disable @typescript-eslint/no-misused-promises */
import express, { Request, Response, Router, NextFunction } from 'express';
import { ActorsController } from '../controllers/actorsController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';
import multer from 'multer';
import { wrapAsync } from '../../../utils/routeHandler';

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
  router.get(
    '/search',
    (req: Request, res: Response, next: NextFunction): void => {
      void actorsController.searchActors(req, res).catch(next);
    }
  );

  // Create new actor
  router.post('/', (req: Request, res: Response, next: NextFunction): void => {
    void actorsController.createActor(req, res, next);
  });

  // Get actor posts
  router.get(
    '/:username/posts',
    (req: Request, res: Response, next: NextFunction): void => {
      void actorsController.getActorPosts(req, res, next);
    }
  );

  // Get actor by username
  router.get(
    '/:username',
    (req: Request, res: Response, next: NextFunction): void => {
      void actorsController.getActorByUsername(req, res).catch(next);
    }
  );

  // Update actor
  router.put(
    '/:id',
    auth,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    wrapAsync(actorsController.updateActor.bind(actorsController))
  );

  // Delete actor
  router.delete(
    '/:id',
    auth,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    wrapAsync(actorsController.deleteActor.bind(actorsController))
  );

  return router;
}
