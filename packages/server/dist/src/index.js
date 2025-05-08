'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.app = exports.serverPromise = void 0;
exports.startServer = startServer;
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const mongodb_1 = require('mongodb');
const errorHandler_1 = require('./middleware/errorHandler');
const container_1 = require('./utils/container');
const serviceMiddleware_1 = require('./middleware/serviceMiddleware');
const compatibilityMiddleware_1 = require('./middleware/compatibilityMiddleware');
const rateLimiter_1 = require('./middleware/rateLimiter');
const plugins_1 = require('./plugins');
const config_1 = __importDefault(require('./config'));
const helmet_1 = __importDefault(require('helmet'));
const logger_1 = __importDefault(require('./utils/logger'));
// Import route configurations from modules
const actorRoutes_1 = __importDefault(
  require('./modules/actors/routes/actorRoutes')
);
const webfingerRoutes_1 = __importDefault(
  require('./modules/webfinger/routes/webfingerRoutes')
);
const postRoutes_1 = __importDefault(
  require('./modules/posts/routes/postRoutes')
);
const authRoutes_1 = __importDefault(
  require('./modules/auth/routes/authRoutes')
);
const activitypubRoutes_1 = require('./modules/activitypub/routes/activitypubRoutes');
const mediaRoutes_1 = require('./modules/media/routes/mediaRoutes');
const notification_routes_1 = require('./modules/notifications/routes/notification.routes');
const comment_routes_1 = __importDefault(
  require('./modules/comments/routes/comment.routes')
);
const app = (0, express_1.default)();
exports.app = app;
const PORT = config_1.default.port || 4000;
const MONGO_URI = config_1.default.mongo.uri;
const DOMAIN = config_1.default.domain;
// Set trust proxy for use behind reverse proxies
app.set('trust proxy', 1);
// Security: Add helmet middleware for secure HTTP headers
app.use((0, helmet_1.default)());
// Middleware
app.use((0, cors_1.default)(config_1.default.cors));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static('public'));
// Apply global rate limiting unless disabled in config or environment
if (
  process.env.NODE_ENV !== 'test' &&
  process.env.DISABLE_RATE_LIMITS !== 'true'
) {
  app.use(rateLimiter_1.defaultRateLimiter);
  logger_1.default.info('Global rate limiting enabled');
} else {
  logger_1.default.warn('Rate limiting disabled for testing');
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
async function startServer() {
  try {
    // Check that JWT_SECRET is defined and not empty
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
      logger_1.default.fatal(
        'JWT_SECRET environment variable is not defined or empty. This is required for secure operation.'
      );
      process.exit(1);
    }
    const client = new mongodb_1.MongoClient(MONGO_URI);
    await client.connect();
    logger_1.default.info('Connected to MongoDB');
    const db = client.db();
    // Create service container with repositories and services
    const services = (0, container_1.createServiceContainer)(db, DOMAIN);
    // Store services in app for middleware access
    app.set('services', services);
    logger_1.default.debug('ServiceContainer initialized');
    // Legacy support - these will be deprecated in future
    app.set('db', db);
    app.set('domain', DOMAIN);
    logger_1.default.info('Initializing server...');
    // Initialize plugins
    (0, plugins_1.initPlugins)(app);
    // Apply middlewares for services and backwards compatibility
    app.use((0, serviceMiddleware_1.serviceMiddleware)(services));
    app.use(compatibilityMiddleware_1.compatibilityMiddleware);
    // Register routes using the standardized configuration pattern
    // Mount each router at an appropriate base path
    const actorsRouter = (0, actorRoutes_1.default)(services);
    app.use('/api/actors', actorsRouter);
    const webfingerRouter = (0, webfingerRoutes_1.default)(services);
    app.use('/', webfingerRouter); // WebFinger must be at the root for discovery
    const activityPubRouter = (0,
    activitypubRoutes_1.configureActivityPubRoutes)(services);
    app.use('/', activityPubRouter); // ActivityPub endpoints must be at the root for federation
    const postsRouter = (0, postRoutes_1.default)(services);
    app.use('/api/posts', postsRouter); // Fixed: Now correctly mounted at /api/posts
    const authRouter = (0, authRoutes_1.default)(services);
    app.use('/api/auth', authRouter);
    const mediaRouter = (0, mediaRoutes_1.configureMediaRoutes)(services);
    app.use('/api/media', mediaRouter); // Mount media routes at /api/media
    const notificationRouter = (0,
    notification_routes_1.configureNotificationRoutes)(services);
    app.use('/api/notifications', notificationRouter);
    const commentRouter = (0, comment_routes_1.default)(services);
    app.use('/api/comments', commentRouter);
    // Error handling middleware should be last
    app.use(errorHandler_1.errorHandler);
    // Start the server only if not in test mode
    let server;
    if (process.env.NODE_ENV !== 'test') {
      server = app.listen(PORT, '0.0.0.0', () => {
        logger_1.default.info(`Server running on http://0.0.0.0:${PORT}`);
      });
      // Implement graceful shutdown
      setupGracefulShutdown(server, client);
    }
    return { app, client, server, db };
  } catch (error) {
    logger_1.default.error({ err: error }, 'Failed to start server');
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
function setupGracefulShutdown(server, mongoClient) {
  // Handle SIGTERM signal (e.g. from kubernetes, heroku, etc)
  process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM received. Shutting down gracefully...');
    gracefullyShutdown(server, mongoClient);
  });
  // Handle SIGINT signal (e.g. from Ctrl+C)
  process.on('SIGINT', () => {
    logger_1.default.info('SIGINT received. Shutting down gracefully...');
    gracefullyShutdown(server, mongoClient);
  });
  // Handle uncaught exceptions - log but still initiate graceful shutdown
  process.on('uncaughtException', error => {
    logger_1.default.fatal({ err: error }, 'UNCAUGHT EXCEPTION');
    gracefullyShutdown(server, mongoClient);
  });
}
/**
 * Perform graceful shutdown of server and database connection
 */
function gracefullyShutdown(server, mongoClient) {
  // First close the server to stop accepting new connections
  server.close(err => {
    if (err) {
      logger_1.default.error({ err }, 'Error closing server');
      process.exit(1);
    }
    logger_1.default.info('Server closed successfully');
    // Then close the MongoDB connection with force=true to terminate all connections
    mongoClient
      .close(true)
      .then(() => {
        logger_1.default.info('MongoDB connection closed successfully');
        process.exit(0);
      })
      .catch(err => {
        logger_1.default.error({ err }, 'Error closing MongoDB connection');
        process.exit(1);
      });
  });
  // Force exit if graceful shutdown takes too long (10 seconds)
  setTimeout(() => {
    logger_1.default.warn('Graceful shutdown timeout. Forcing exit.');
    process.exit(1);
  }, 10000);
}
// For testing purposes, we export the promise
exports.serverPromise = startServer();
