import express, { Router } from 'express';
import configureAuthRoutes from '../modules/auth/routes/authRoutes';
import configurePostRoutes from '../modules/posts/routes/postRoutes';
import configureActorRoutes from '../modules/actors/routes/actorRoutes';
import { ServiceContainer } from '../utils/container';

/**
 * Configure and mount all application routes
 */
export function configureRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();

  // Mount auth routes
  router.use('/auth', configureAuthRoutes(serviceContainer));

  // Mount posts routes
  const { postsController, commentsController, authService } = serviceContainer;
  router.use(
    '/posts',
    configurePostRoutes(postsController, commentsController, authService)
  );

  // Mount actor routes
  router.use('/actors', configureActorRoutes(serviceContainer));

  return router;
}

export default configureRoutes;
