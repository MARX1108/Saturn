import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import actorsRouter from "./routes/actors";
import webfingerRouter from "./routes/webfinger";
import postsRouter from "./routes/posts";
import { errorHandler } from "./middleware/errorHandler";
import { createServiceContainer } from "./utils/container";
import { serviceMiddleware } from "./middleware/serviceMiddleware";
import { initPlugins } from "./plugins";
import config from "./config";

const app = express();
const PORT = config.port || 4000;
const MONGO_URI = config.mongo.uri;
const DOMAIN = config.domain;

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();

    // Create service container with repositories and services
    const services = createServiceContainer(db, DOMAIN);
    
    // Store services in app for middleware access
    app.set("services", services);
    
    // Legacy support - these will be deprecated in future
    app.set("db", db);
    app.set("domain", DOMAIN);

    console.log("Initializing server...");
    
    // Initialize plugins
    initPlugins(app);

    // Apply service middleware to all routes
    app.use(serviceMiddleware);

    // Register routes
    app.use("/", actorsRouter);
    app.use("/", webfingerRouter);
    app.use("/api", postsRouter);

    // Error handling middleware should be last
    app.use(errorHandler);

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
    
    return { app, client };
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// For testing purposes, we export the promise
export const serverPromise = startServer();

// Only in production or development, not in test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
