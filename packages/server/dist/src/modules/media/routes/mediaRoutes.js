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
const routeHandler_1 = require('../../../utils/routeHandler');
/**
 * Configure media routes with dependency injection
 */
function configureMediaRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { mediaService, uploadService: _uploadService } = serviceContainer;
  // Create controller with injected service
  const mediaController = new media_controller_1.MediaController(mediaService);
  // Upload media
  router.post(
    '/upload',
    (0, routeHandler_1.wrapAsync)(async (req, res, next) => {
      return mediaController.uploadMedia(req, res);
    })
  );
  // Get media by ID
  router.get(
    '/:id',
    (0, routeHandler_1.wrapAsync)(async (req, res, next) => {
      return mediaController.getMedia(req, res);
    })
  );
  // Delete media
  router.delete(
    '/:id',
    (0, routeHandler_1.wrapAsync)(async (req, res, next) => {
      return mediaController.deleteMedia(req, res);
    })
  );
  return router;
}
exports.default = configureMediaRoutes;
