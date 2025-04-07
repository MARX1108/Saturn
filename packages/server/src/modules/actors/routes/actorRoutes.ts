import express, { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ActorsController } from "../controllers/actorsController";
import { auth } from "../../../middleware/auth";
import { ServiceContainer } from "../../../utils/container";

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(serviceContainer: ServiceContainer): Router {
  const router = express.Router();
  const actorsController = new ActorsController();
  const actorService = serviceContainer.getService('actorService');

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

  // Search actors
  router.get("/search", (req: Request, res: Response) => {
    return actorsController.searchActors(req, res);
  });

  // Create new actor
  router.post("/", (req: Request, res: Response) => {
    upload.single("avatarFile")(req as any, res as any, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return actorsController.createActor(req, res);
    });
  });

  // Get actor by username
  router.get("/:username", (req: Request, res: Response) => {
    return actorsController.getActorByUsername(req, res);
  });

  // Update actor - requires authentication
  router.put("/:username", auth, (req: Request, res: Response) => {
    upload.single("avatarFile")(req as any, res as any, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return actorsController.updateActor(req, res);
    });
  });

  // Delete actor - requires authentication
  router.delete("/:username", auth, (req: Request, res: Response) => {
    return actorsController.deleteActor(req, res);
  });

  return router;
}

// Keep the old signature for backwards compatibility during transition
export function configureActorRoutesLegacy(db: Db, domain: string): Router {
  // Create a service container from legacy params
  const serviceContainer = {
    getService: (name: string) => {
      if (name === 'actorService') {
        // Return a minimal implementation to keep things working
        return {};
      }
      return null;
    }
  } as ServiceContainer;
  
  return configureActorRoutes(serviceContainer);
}