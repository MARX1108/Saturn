import express, { Router } from 'express';
import configureAuthRoutes from '../modules/auth/routes/authRoutes';
import configurePostRoutes from '../modules/posts/routes/postRoutes';
import configureActorRoutes from '../modules/actors/routes/actorRoutes';
import { ServiceContainer } from '../utils/container';

/**
 * Configure and mount all application routes
 */
export function configureRoutes(serviceContainer: ServiceContainer): Router {
  console.log('[configureRoutes] Starting...');
  const router = express.Router();

  // Mount auth routes
  console.log('[configureRoutes] Configuring auth routes...');
  router.use('/auth', configureAuthRoutes(serviceContainer));
  console.log('[configureRoutes] Auth routes configured.');

  // Mount posts routes
  console.log('[configureRoutes] Configuring posts routes...');
  const { postsController, commentsController, authService } = serviceContainer;
  router.use(
    '/posts',
    configurePostRoutes(postsController, commentsController, authService)
  );
  console.log('[configureRoutes] Posts routes configured.');

  // Mount actor routes
  console.log('[configureRoutes] Configuring actor routes...');
  router.use('/actors', configureActorRoutes(serviceContainer));
  console.log('[configureRoutes] Actor routes configured.');

  console.log('[configureRoutes] Returning router...');
  return router;
}

export default configureRoutes;
