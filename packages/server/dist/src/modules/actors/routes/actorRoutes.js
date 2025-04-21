'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureActorRoutes;
const express_1 = __importDefault(require('express'));
const actorsController_1 = require('../controllers/actorsController');
const auth_1 = require('../../../middleware/auth');
/**
 * Configure actor routes with the controller
 */
function configureActorRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { actorService, uploadService, postService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';
  // Create controller with injected dependencies
  const actorsController = new actorsController_1.ActorsController(
    actorService,
    uploadService,
    postService,
    domain
  );
  // Configure image upload middleware with UploadService
  // Temporarily commented out to debug setup
  // const imageUpload = uploadService.configureImageUploadMiddleware({
  //   fileSizeLimitMB: 5, // 5MB limit
  // });
  // Search actors
  router.get('/search', (req, res, next) => {
    actorsController.searchActors(req, res).catch(next);
  });
  // Create new actor
  router.post('/', (req, res, next) => {
    // Temporarily modified to skip upload
    actorsController.createActor(req, res).catch(next);
  });
  // Get actor posts
  router.get('/:username/posts', (req, res, next) => {
    actorsController.getActorPosts(req, res, next).catch(next);
  });
  // Get actor by username
  router.get('/:username', (req, res, next) => {
    actorsController.getActorByUsername(req, res).catch(next);
  });
  // Update actor
  router.put('/:id', auth_1.auth, (req, res, next) => {
    // Temporarily modified to skip upload
    actorsController.updateActor(req, res).catch(next);
  });
  // Delete actor
  router.delete('/:id', auth_1.auth, (req, res, next) => {
    actorsController.deleteActor(req, res).catch(next);
  });
  return router;
}
