import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ActorService } from "../src/services/actorService";
import { CreateActorRequest } from "../src/types/actor";
import { Db } from "mongodb";

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware to initialize actorService with database connection
const initActorService = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Get database from app locals
  const db = req.app.get("db") as Db;
  if (!db) {
    return res.status(500).json({ error: "Database connection not available" });
  }

  const domain = req.app.get("domain") as string;
  if (!domain) {
    return res
      .status(500)
      .json({ error: "Domain configuration not available" });
  }

  // Create actorService instance for this request
  req.actorService = new ActorService(db, domain);
  next();
};

// Apply this middleware to all routes in this router
router.use(initActorService);

// Create new actor
router.post("/", (req, res) => {
  // Use multer middleware as a function to handle the file upload
  upload.single("avatarFile")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Extract data from request
      const { username, displayName, bio, password } = req.body;
      const avatarFile = req.file;

      // Validate required fields
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Validate username (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          error: "Username can only contain letters, numbers, and underscores",
        });
      }

      // Check if username already exists
      const exists = await req.actorService!.usernameExists(username);
      if (exists) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Handle avatar
      let iconInfo = undefined;
      if (avatarFile) {
        // Move to permanent storage in public directory
        const publicDir = path.join(process.cwd(), "public", "avatars");
        fs.mkdirSync(publicDir, { recursive: true });

        const fileExt = path.extname(avatarFile.originalname);
        const fileName = `${username}-${Date.now()}${fileExt}`;
        const finalPath = path.join(publicDir, fileName);

        fs.renameSync(avatarFile.path, finalPath);

        const domain = process.env.DOMAIN || "localhost:4000";
        iconInfo = {
          url: `https://${domain}/avatars/${fileName}`,
          mediaType: avatarFile.mimetype,
        };
      }

      // Create actor data
      const actorData: CreateActorRequest = {
        username,
        displayName,
        bio,
        password, // Include password for actor creation
      };

      // Create actor through service
      const actor = await req.actorService!.createActor(actorData, iconInfo);

      // Format response to match test expectations
      const response = {
        ...actor,
        // Add these fields to match test expectations
        preferredUsername: actor.username,
        name: actor.displayName,
        summary: actor.bio,
      };

      // Format icon if available
      if (iconInfo) {
        response.icon = iconInfo;
      }

      return res.status(201).json(response);
    } catch (error) {
      console.error("Error creating actor:", error);
      return res.status(500).json({ error: "Failed to create actor" });
    }
  });
});

// Get actor by username
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const actor = await req.actorService!.getActorByUsername(username);

    if (!actor) {
      return res.status(404).json({ error: "Actor not found" });
    }

    // Format response to match test expectations
    const response = {
      ...actor,
      // Add these fields to match test expectations
      preferredUsername: actor.username,
      name: actor.displayName,
      summary: actor.bio,
    };

    // Format icon if available
    if (actor.icon) {
      response.icon = actor.icon;
    }

    return res.json(response);
  } catch (error) {
    console.error("Error fetching actor:", error);
    return res.status(500).json({ error: "Failed to fetch actor" });
  }
});

// Update actor
router.put("/:username", (req, res) => {
  upload.single("avatarFile")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { username } = req.params;
      const { displayName, bio } = req.body;
      const avatarFile = req.file;

      // Check if actor exists
      const exists = await req.actorService!.usernameExists(username);
      if (!exists) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Handle avatar update
      let iconInfo = undefined;
      if (avatarFile) {
        // Move to permanent storage
        const publicDir = path.join(process.cwd(), "public", "avatars");
        fs.mkdirSync(publicDir, { recursive: true });

        const fileExt = path.extname(avatarFile.originalname);
        const fileName = `${username}-${Date.now()}${fileExt}`;
        const finalPath = path.join(publicDir, fileName);

        fs.renameSync(avatarFile.path, finalPath);

        const domain = process.env.DOMAIN || "localhost:4000";
        iconInfo = {
          url: `https://${domain}/avatars/${fileName}`,
          mediaType: avatarFile.mimetype,
        };
      }

      // Update actor
      const updates = {
        displayName,
        bio,
      };

      const updatedActor = await req.actorService!.updateActor(
        username,
        updates,
        iconInfo
      );

      if (!updatedActor) {
        return res.status(404).json({ error: "Actor not found" });
      }

      // Format response to match test expectations
      const response = {
        ...updatedActor,
        // Add these fields to match test expectations
        preferredUsername: updatedActor.username,
        name: updatedActor.displayName,
        summary: updatedActor.bio,
      };

      // Format icon if available
      if (iconInfo) {
        response.icon = iconInfo;
      } else if (updatedActor.icon) {
        response.icon = updatedActor.icon;
      }

      return res.json(response);
    } catch (error) {
      console.error("Error updating actor:", error);
      return res.status(500).json({ error: "Failed to update actor" });
    }
  });
});

// Delete actor (optional)
router.delete("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const deleted = await req.actorService!.deleteActor(username);

    if (!deleted) {
      return res.status(404).json({ error: "Actor not found" });
    }

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting actor:", error);
    return res.status(500).json({ error: "Failed to delete actor" });
  }
});

// Get ActivityPub actor profile (federated)
router.get("/users/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // Check Accept header for ActivityPub requests
    const acceptHeader = req.get("Accept");
    if (!acceptHeader || !acceptHeader.includes("application/activity+json")) {
      // Redirect to user profile page for browsers
      return res.redirect(`/profile/${username}`);
    }

    const actor = await req.actorService!.getFullActorByUsername(username);

    if (!actor) {
      return res.status(404).json({ error: "Actor not found" });
    }

    // Return ActivityPub compliant actor
    return res.json({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
      ],
      ...actor,
    });
  } catch (error) {
    console.error("Error fetching ActivityPub actor:", error);
    return res.status(500).json({ error: "Failed to fetch actor" });
  }
});

export default router;
