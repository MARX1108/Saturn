import express, { Request, Response, Application } from "express";
import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/fyp-saturn";

// Import plugin system
import { registerPlugin, initPlugins } from "./plugins";
import helloPlugin from "./plugins/helloPlugin";

// Import routes
import actorRoutes from "./routes/actors";
import authRoutes from "./routes/auth";
import { auth } from "./middleware/auth";

// Extract route configuration to a separate function
function configureRoutes(app: Application, db: Db, domain: string): void {
  // API routes
  app.use("/api/actors", actorRoutes(db, domain));
  app.use("/api/auth", authRoutes(db, domain));

  // Protected routes that require authentication
  app.use("/api/me", auth, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  // Legacy routes
  app.post("/api/create-actor", async (req: Request, res: Response) => {
    try {
      const { username, displayName } = req.body;

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // Check if user already exists
      const existingUser = await db.collection("users").findOne({ username });
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Create a new user
      const user = {
        username,
        displayName: displayName || username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Insert into database
      await db.collection("users").insertOne(user);

      return res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/user/:username", async (req: Request, res: Response) => {
    try {
      const { username } = req.params;

      // Find user in database
      const user = await db.collection("users").findOne({ username });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await db.collection("users").find().toArray();
      return res.json({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Add user search endpoint
  app.get("/api/users/search", async (req: Request, res: Response) => {
    try {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }

      // Search by username or display name
      const users = await db
        .collection("users")
        .find({
          $or: [
            { username: { $regex: q, $options: "i" } },
            { displayName: { $regex: q, $options: "i" } },
          ],
        })
        .toArray();

      return res.json({ users });
    } catch (error) {
      console.error("Error searching users:", error);
      return res.status(500).json({ error: "Failed to search users" });
    }
  });

  // Add federation resolve endpoint
  app.post("/api/federation/resolve", async (req: Request, res: Response) => {
    try {
      const { username, domain } = req.body;

      if (!username || !domain) {
        return res
          .status(400)
          .json({ error: "Username and domain are required" });
      }

      // In a real implementation, this would make a request to the remote server
      // For now, just return a mock response
      const actorUrl = `https://${domain}/users/${username}`;

      // TODO: Add actual HTTP request to fetch remote actor
      // const response = await fetch(actorUrl, {
      //   headers: { 'Accept': 'application/activity+json' }
      // });
      // const actor = await response.json();

      const mockActor = {
        id: actorUrl,
        type: "Person",
        preferredUsername: username,
        name: username,
        inbox: `https://${domain}/users/${username}/inbox`,
        outbox: `https://${domain}/users/${username}/outbox`,
        followers: `https://${domain}/users/${username}/followers`,
        following: `https://${domain}/users/${username}/following`,
        url: actorUrl,
      };

      return res.json(mockActor);
    } catch (error) {
      console.error("Error resolving remote user:", error);
      return res.status(500).json({ error: "Failed to resolve remote user" });
    }
  });

  // Utility routes
  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });
}

async function startServer(): Promise<void> {
  try {
    console.log("Connecting to MongoDB...");
    // Connect to MongoDB
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅ Connected to MongoDB");
    const db = client.db();

    // Store db connection in app locals for use in routes
    app.locals.db = db;

    // Middleware
    app.use(express.json());
    app.use(cors()); // Enable CORS for all routes

    // Serve static files from public directory
    app.use(express.static(path.join(process.cwd(), "public")));

    console.log("Initializing server...");

    // Register plugins
    registerPlugin(helloPlugin);
    initPlugins(app);

    // Register routes with proper parameters
    const domain = process.env.DOMAIN || "localhost:4000";
    configureRoutes(app, db, domain);

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 FYP Saturn server running at http://localhost:${PORT}`);
      console.log(`API is available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
