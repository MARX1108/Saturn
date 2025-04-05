import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Db } from "mongodb";
import { ActorsController } from "../controllers/actorsController";

/**
 * Configure actor routes with the controller
 */
export function configureActorRoutes(db: Db, domain: string) {
  const router = express.Router();
  const actorsController = new ActorsController();

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

  // Middleware to inject db and domain into app for controller access
  router.use((req, res, next) => {
    req.app.set("db", db);
    req.app.set("domain", domain);
    next();
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

  // Generic routes - these will match any username
  
  // Get actor by username
  router.get("/:username", (req: Request, res: Response) => {
    return actorsController.getActorByUsername(req, res);
  });

  // Update actor
  router.put("/:username", (req: Request, res: Response) => {
    upload.single("avatarFile")(req as any, res as any, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      return actorsController.updateActor(req, res);
    });
  });

  // Delete actor
  router.delete("/:username", (req: Request, res: Response) => {
    return actorsController.deleteActor(req, res);
  });

  return router;
}