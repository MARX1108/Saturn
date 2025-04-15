import express, { Request, Response, Router, NextFunction } from 'express';
import { ActorsController } from '../controllers/actorsController';
import { auth } from '../../../middleware/auth';
import { ServiceContainer } from '../../../utils/container';

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(
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
  router.get('/search', function (req, res, next) {
    actorsController.searchActors(req as any, res).catch(next);
  });

  // Create new actor
  router.post('/', function (req, res, next) {
    const upload = imageUpload.single('avatarFile');
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      actorsController.createActor(req as any, res).catch(error => next(error));
    });
  });

  // Get actor posts - defined before /:username to ensure proper route handling
  router.get('/:username/posts', function (req, res, next) {
    actorsController.getActorPosts(req, res, next);
  });

  // Get actor by username
  router.get('/:username', function (req, res, next) {
    // Cast to any to bypass the type checking error
    actorsController.getActorByUsername(req as any, res).catch(next);
  });

  // Update actor - requires authentication - need to cast auth middleware to any to bypass type error
  router.put('/:username', auth as any, function (req, res, next) {
    const upload = imageUpload.single('avatarFile');
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      actorsController.updateActor(req as any, res).catch(error => next(error));
    });
  });

  // Delete actor - requires authentication
  router.delete('/:username', auth as any, function (req, res, next) {
    actorsController.deleteActor(req as any, res).catch(next);
  });

  return router;
}
