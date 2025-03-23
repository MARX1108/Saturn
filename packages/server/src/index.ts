import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import actorsRouter from "./routes/actors";
import webfingerRouter from "./routes/webfinger";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/saturn";
const DOMAIN = process.env.DOMAIN || "localhost:4000";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Connect to MongoDB
async function startServer() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();

    // Store database connection in app
    app.set("db", db);
    app.set("domain", DOMAIN);

    console.log("Initializing server...");

    // Register routes - fix: Pass app as the first argument
    app.use("/", actorsRouter);
    app.use("/", webfingerRouter);

    // Error handling middleware should be last
    app.use(errorHandler);

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
