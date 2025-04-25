import express, { Router } from 'express';
import configureAuthRoutes from '../modules/auth/routes/authRoutes';
import configurePostRoutes from '../modules/posts/routes/postRoutes';
import configureActorRoutes from '../modules/actors/routes/actorRoutes';
import configureCommentRoutes from '../modules/comments/routes/comment.routes';
import { configureNotificationRoutes } from '../modules/notifications/routes/notification.routes';
import { ServiceContainer } from '../utils/container';

/**
 * Configure and mount all application routes
 */
export function configureRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();

  router.use('/auth', configureAuthRoutes(serviceContainer));

  router.use('/posts', configurePostRoutes(serviceContainer));

  router.use('/actors', configureActorRoutes(serviceContainer));

  // Add notification routes
  router.use('/notifications', configureNotificationRoutes(serviceContainer));

  // Add comment routes
  router.use('/comments', configureCommentRoutes(serviceContainer));

  return router;
}

export default configureRoutes;
