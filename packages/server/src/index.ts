import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { errorHandler } from './middleware/errorHandler';
import { createServiceContainer } from './utils/container';
import { serviceMiddleware } from './middleware/serviceMiddleware';
import { compatibilityMiddleware } from './middleware/compatibilityMiddleware';
import { defaultRateLimiter } from './middleware/rateLimiter';
import { initPlugins } from './plugins';
import config from './config';
import helmet from 'helmet';
import logger from './utils/logger';

// Import route configurations from modules
import configureActorRoutes from './modules/actors/routes/actorRoutes';
import configureWebFingerRoutes from './modules/webfinger/routes/webfingerRoutes';
import configurePostRoutes from './modules/posts/routes/postRoutes';
import configureAuthRoutes from './modules/auth/routes/authRoutes';
import { configureActivityPubRoutes } from './modules/activitypub/routes/activitypubRoutes';
import { configureMediaRoutes } from './modules/media/routes/mediaRoutes';
import { configureNotificationRoutes } from './modules/notifications/routes/notification.routes';
import configureCommentRoutes from './modules/comments/routes/comment.routes';

const app = express();
const PORT = config.port || 4000;
const MONGO_URI = config.mongo.uri;
const DOMAIN = config.domain;

// Set trust proxy for use behind reverse proxies
app.set('trust proxy', 1);

// Security: Add helmet middleware for secure HTTP headers
app.use(helmet());

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Apply global rate limiting unless disabled in config or environment
if (
  process.env.NODE_ENV !== 'test' &&
  process.env.DISABLE_RATE_LIMITS !== 'true'
) {
  app.use(defaultRateLimiter);
  logger.info('Global rate limiting enabled');
} else {
  logger.warn('Rate limiting disabled for testing');
}

// Root route handler
app.get('/', (req, res) => {
  res.json({
    message: 'FYP-Saturn API Server',
    version: '0.1.0',
    documentation: '/api/docs',
    status: 'online',
  });
});

// Connect to MongoDB
export async function startServer(): Promise<{
  app: express.Application;
  client: MongoClient;
  server?: ReturnType<express.Application['listen']>;
  db: ReturnType<MongoClient['db']>;
}> {
  try {
    // Check that JWT_SECRET is defined and not empty
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      logger.fatal(
        'JWT_SECRET environment variable is not defined or empty. This is required for secure operation.'
      );
      process.exit(1);
    }

    const client = new MongoClient(MONGO_URI);
    await client.connect();
    logger.info('Connected to MongoDB');

    const db = client.db();

    // Create service container with repositories and services
    const services = createServiceContainer(db, DOMAIN);

    // Store services in app for middleware access
    app.set('services', services);
    logger.debug('ServiceContainer initialized');

    // Legacy support - these will be deprecated in future
    app.set('db', db);
    app.set('domain', DOMAIN);

    logger.info('Initializing server...');

    // Initialize plugins
    initPlugins(app);

    // Apply middlewares for services and backwards compatibility
    app.use(serviceMiddleware(services));
    app.use(compatibilityMiddleware as RequestHandler);

    // Register routes using the standardized configuration pattern
    // Mount each router at an appropriate base path
    const actorsRouter = configureActorRoutes(services);
    app.use('/api/actors', actorsRouter);

    const webfingerRouter = configureWebFingerRoutes(services);
    app.use('/', webfingerRouter); // WebFinger must be at the root for discovery

    const activityPubRouter = configureActivityPubRoutes(services);
    app.use('/', activityPubRouter); // ActivityPub endpoints must be at the root for federation

    const postsRouter = configurePostRoutes(services);
    app.use('/api/posts', postsRouter); // Fixed: Now correctly mounted at /api/posts

    const authRouter = configureAuthRoutes(services);
    app.use('/api/auth', authRouter);

    const mediaRouter = configureMediaRoutes(services);
    app.use('/api/media', mediaRouter); // Mount media routes at /api/media

    const notificationRouter = configureNotificationRoutes(services);
    app.use('/api/notifications', notificationRouter);

    const commentRouter = configureCommentRoutes(services);
    app.use('/api/comments', commentRouter);

    // Error handling middleware should be last
    app.use(errorHandler as ErrorRequestHandler);

    // Start the server only if not in test mode
    let server;
    if (process.env.NODE_ENV !== 'test') {
      server = app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Server running on http://0.0.0.0:${PORT}`);
      });

      // Implement graceful shutdown
      setupGracefulShutdown(server, client);
    }

    return { app, client, server, db };
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

/**
 * Set up graceful shutdown handlers for the server
 */
function setupGracefulShutdown(
  server: ReturnType<express.Application['listen']>,
  mongoClient: MongoClient
): void {
  // Handle SIGTERM signal (e.g. from kubernetes, heroku, etc)
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    gracefullyShutdown(server, mongoClient);
  });

  // Handle SIGINT signal (e.g. from Ctrl+C)
  process.on('SIGINT', () => {
    logger.info('SIGINT received. Shutting down gracefully...');
    gracefullyShutdown(server, mongoClient);
  });

  // Handle uncaught exceptions - log but still initiate graceful shutdown
  process.on('uncaughtException', error => {
    logger.fatal({ err: error }, 'UNCAUGHT EXCEPTION');
    gracefullyShutdown(server, mongoClient);
  });
}

/**
 * Perform graceful shutdown of server and database connection
 */
function gracefullyShutdown(
  server: ReturnType<express.Application['listen']>,
  mongoClient: MongoClient
): void {
  // First close the server to stop accepting new connections
  server.close(err => {
    if (err) {
      logger.error({ err }, 'Error closing server');
      process.exit(1);
    }

    logger.info('Server closed successfully');

    // Then close the MongoDB connection with force=true to terminate all connections
    mongoClient
      .close(true)
      .then(() => {
        logger.info('MongoDB connection closed successfully');
        process.exit(0);
      })
      .catch(err => {
        logger.error({ err }, 'Error closing MongoDB connection');
        process.exit(1);
      });
  });

  // Force exit if graceful shutdown takes too long (10 seconds)
  setTimeout(() => {
    logger.warn('Graceful shutdown timeout. Forcing exit.');
    process.exit(1);
  }, 10000);
}

// For testing purposes, we export the promise
export const serverPromise = startServer();

// Export the app for testing
export { app };
