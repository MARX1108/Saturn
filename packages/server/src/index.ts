import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import { errorHandler } from "./middleware/errorHandler";
import { createServiceContainer } from "./utils/container";
import { serviceMiddleware } from "./middleware/serviceMiddleware";
import { initPlugins } from "./plugins";
import config from "./config";

// Import route configurations from modules
import { configureActorRoutes } from "./modules/actors/routes/actorRoutes";
import { configureWebFingerRoutes } from "./modules/webfinger/routes/webfingerRoutes";
import { configurePostRoutes } from "./modules/posts/routes/postRoutes";
import { configureAuthRoutes } from "./modules/auth/routes/authRoutes";
import { configureActivityPubRoutes } from "./modules/activitypub/routes/activitypubRoutes";

const app = express();
const PORT = config.port || 4000;
const MONGO_URI = config.mongo.uri;
const DOMAIN = config.domain;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
export async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();

    // Create service container with repositories and services
    const services = createServiceContainer(db, DOMAIN);
    
    // Store services in app for middleware access
    app.set("services", services);
    console.log("ServiceContainer initialized:", services);
    
    // Legacy support - these will be deprecated in future
    app.set("db", db);
    app.set("domain", DOMAIN);

    console.log("Initializing server...");
    
    // Initialize plugins
    initPlugins(app);

    // Apply service middleware to all routes
    app.use(serviceMiddleware);

    // Register routes using the modular controller-based architecture
    // Mount each router at an appropriate base path
    const actorsRouter = configureActorRoutes(db, DOMAIN);
    app.use("/api/actors", actorsRouter);
    
    const webfingerRouter = configureWebFingerRoutes(db, DOMAIN);
    app.use("/", webfingerRouter); // WebFinger must be at the root for discovery
    
    const activityPubRouter = configureActivityPubRoutes(db, DOMAIN);
    app.use("/", activityPubRouter); // ActivityPub endpoints must be at the root for federation
    
    const postsRouter = configurePostRoutes(db, DOMAIN);
    app.use("/api", postsRouter);
    
    const authRouter = configureAuthRoutes(db, DOMAIN);
    app.use("/api/auth", authRouter);

    // Error handling middleware should be last
    app.use(errorHandler);

    // Start the server only if not in test mode
    let server;
    if (process.env.NODE_ENV !== 'test') {
      server = app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
    
    return { app, client, server, db };
  } catch (error) {
    console.error("Failed to start server:", error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

// Export the app for testing
export { app };

// For testing purposes, we export the promise
export const serverPromise = startServer();
