import { Router } from "express";
import { MediaController } from "../controllers/media.controller";
import { MediaService } from "../services/media.service";
import { db } from "../../../config/database";

// Initialize the router
const router = Router();

// Create service and controller instances
const uploadPath = process.env.UPLOAD_PATH || "./uploads";
const mediaService = new MediaService(db, uploadPath);
const mediaController = new MediaController(mediaService);

// Define routes
router.post("/upload", (req, res) => mediaController.uploadMedia(req, res));
router.get("/:id", (req, res) => mediaController.getMedia(req, res));
router.delete("/:id", (req, res) => mediaController.deleteMedia(req, res));

export default router;