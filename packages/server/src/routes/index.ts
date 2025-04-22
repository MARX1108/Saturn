import express, { Router } from 'express';
import configureAuthRoutes from '../modules/auth/routes/authRoutes';
import configurePostRoutes from '../modules/posts/routes/postRoutes';
import configureActorRoutes from '../modules/actors/routes/actorRoutes';
import { ServiceContainer } from '../utils/container';

/**
 * Configure and mount all application routes
 */
export function configureRoutes(serviceContainer: ServiceContainer): Router {
  console.log('[configureRoutes] Starting route configuration...');
  const router = express.Router();

  console.log('[configureRoutes]   - Mounting /auth routes...');
  router.use('/auth', configureAuthRoutes(serviceContainer));
  console.log('[configureRoutes]   - /auth routes mounted.');

  console.log('[configureRoutes]   - Mounting /posts routes...');
  router.use('/posts', configurePostRoutes(serviceContainer));
  console.log('[configureRoutes]   - /posts routes mounted.');

  console.log('[configureRoutes]   - Mounting /actors routes...');
  router.use('/actors', configureActorRoutes(serviceContainer));
  console.log('[configureRoutes]   - /actors routes mounted.');

  console.log('[configureRoutes] Finished configuration, returning router.');
  return router;
}

export default configureRoutes;
