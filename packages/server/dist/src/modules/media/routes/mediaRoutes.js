'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureMediaRoutes = configureMediaRoutes;
const express_1 = __importDefault(require('express'));
const media_controller_1 = require('../controllers/media.controller');
/**
 * Configure media routes with dependency injection
 */
function configureMediaRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { mediaService, uploadService: _uploadService } = serviceContainer;
  // Create controller with injected service
  const mediaController = new media_controller_1.MediaController(mediaService);
  // Upload media
  router.post('/upload', (req, res, next) => {
    mediaController.uploadMedia(req, res).catch(next);
  });
  // Get media by ID
  router.get('/:id', (req, res, next) => {
    mediaController.getMedia(req, res).catch(next);
  });
  // Delete media
  router.delete('/:id', (req, res, next) => {
    mediaController.deleteMedia(req, res).catch(next);
  });
  return router;
}
exports.default = configureMediaRoutes;
