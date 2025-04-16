import express from 'express';
import cors from 'cors';
import { MongoClient, Db } from 'mongodb';
import { errorHandler } from '../../src/middleware/errorHandler';
import { createServiceContainer } from '../../src/utils/container';
import { serviceMiddleware } from '../../src/middleware/serviceMiddleware';
import { compatibilityMiddleware } from '../../src/middleware/compatibilityMiddleware';
import { initPlugins } from '../../src/plugins';

// Import route configurations
import configureActorRoutes from '../../src/modules/actors/routes/actorRoutes';
import configureWebFingerRoutes from '../../src/modules/webfinger/routes/webfingerRoutes';
import configurePostRoutes from '../../src/modules/posts/routes/postRoutes';
import configureAuthRoutes from '../../src/modules/auth/routes/authRoutes';
import { configureActivityPubRoutes } from '../../src/modules/activitypub/routes/activitypubRoutes';
import { configureMediaRoutes } from '../../src/modules/media/routes/mediaRoutes';
import { configureNotificationRoutes } from '../../src/modules/notifications/routes/notification.routes';
import configureCommentRoutes from '../../src/modules/comments/routes/comment.routes';

export async function createTestApp(db: Db, domain: string) {
  const app = express();

  // Apply middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));

  // Create service container
  const services = createServiceContainer(db, domain);

  // Store services in app
  app.set('services', services);
  app.set('db', db);
  app.set('domain', domain);

  // Initialize plugins
  initPlugins(app);

  // Apply middlewares
  app.use(serviceMiddleware(services));
  app.use(compatibilityMiddleware);

  // Mount routes with correct base paths
  app.use('/api/actors', configureActorRoutes(services));
  app.use('/', configureWebFingerRoutes(services));
  app.use('/', configureActivityPubRoutes(services));
  app.use(
    '/api/posts',
    configurePostRoutes(
      services.postsController,
      services.commentsController,
      services.authService
    )
  );
  app.use('/api/auth', configureAuthRoutes(services));
  app.use('/api/media', configureMediaRoutes(services));
  app.use('/api/notifications', configureNotificationRoutes(services));
  app.use('/api/comments', configureCommentRoutes(services));

  // Error handling
  app.use(errorHandler);

  return app;
}
