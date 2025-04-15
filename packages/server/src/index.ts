import express, { RequestHandler, ErrorRequestHandler } from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { errorHandler } from './middleware/errorHandler';
import { createServiceContainer } from './utils/container';
import { serviceMiddleware } from './middleware/serviceMiddleware';
import { compatibilityMiddleware } from './middleware/compatibilityMiddleware';
import { initPlugins } from './plugins';
import config from './config';

// Import route configurations from modules
import configureActorRoutes from './modules/actors/routes/actorRoutes';
import configureWebFingerRoutes from './modules/webfinger/routes/webfingerRoutes';
import configurePostRoutes from './modules/posts/routes/postRoutes';
import configureAuthRoutes from './modules/auth/routes/authRoutes';
import { configureActivityPubRoutes } from './modules/activitypub/routes/activitypubRoutes';
import { configureMediaRoutes } from './modules/media/routes/mediaRoutes';

const app = express();
const PORT = config.port || 4000;
const MONGO_URI = config.mongo.uri;
const DOMAIN = config.domain;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.static('public'));

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
  server?: any;
  db: any;
}> {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();

    // Create service container with repositories and services
    const services = createServiceContainer(db, DOMAIN);

    // Store services in app for middleware access
    app.set('services', services);
    console.log('ServiceContainer initialized:', services);

    // Legacy support - these will be deprecated in future
    app.set('db', db);
    app.set('domain', DOMAIN);

    console.log('Initializing server...');

    // Initialize plugins
    initPlugins(app);

    // Apply middlewares for services and backwards compatibility
    app.use(serviceMiddleware as RequestHandler);
    app.use(compatibilityMiddleware as RequestHandler);

    // Register routes using the standardized configuration pattern
    // Mount each router at an appropriate base path
    const actorsRouter = configureActorRoutes(services);
    app.use('/api/actors', actorsRouter);

    const webfingerRouter = configureWebFingerRoutes(services);
    app.use('/', webfingerRouter); // WebFinger must be at the root for discovery

    const activityPubRouter = configureActivityPubRoutes(services);
    app.use('/', activityPubRouter); // ActivityPub endpoints must be at the root for federation

    const postsRouter = configurePostRoutes(
      services.postsController,
      services.commentsController,
      services.authService
    );
    app.use('/api/posts', postsRouter); // Fixed: Now correctly mounted at /api/posts

    const authRouter = configureAuthRoutes(services);
    app.use('/api/auth', authRouter);

    const mediaRouter = configureMediaRoutes(services);
    app.use('/api/media', mediaRouter); // Mount media routes at /api/media

    // Error handling middleware should be last
    app.use(errorHandler as ErrorRequestHandler);

    // Start the server only if not in test mode
    let server;
    if (process.env.NODE_ENV !== 'test') {
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }

    return { app, client, server, db };
  } catch (error) {
    console.error('Failed to start server:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw error;
    }
  }
}

// For testing purposes, we export the promise
export const serverPromise = startServer();

// Export the app for testing
export { app };
