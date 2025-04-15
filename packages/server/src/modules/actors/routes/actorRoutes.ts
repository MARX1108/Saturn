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
  const imageUpload = uploadService.configureImageUploadMiddleware({
    fileSizeLimitMB: 5, // 5MB limit
  });

  // Search actors
  router.get(
    '/search',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.searchActors(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  // Create new actor
  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const upload = imageUpload.single('avatarFile');
    upload(req, res, async err => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      try {
        await actorsController.createActor(req, res);
      } catch (error) {
        next(error);
      }
    });
  });

  // Get actor posts - defined before /:username to ensure proper route handling
  router.get(
    '/:username/posts',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.getActorPosts(req, res, next);
      } catch (error) {
        next(error);
      }
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

  // Update actor - requires authentication
  router.put(
    '/:username',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      const upload = imageUpload.single('avatarFile');
      upload(req, res, async err => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        try {
          await actorsController.updateActor(req, res);
        } catch (error) {
          next(error);
        }
      });
    }
  );

  // Delete actor - requires authentication
  router.delete(
    '/:username',
    auth,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await actorsController.deleteActor(req, res);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
