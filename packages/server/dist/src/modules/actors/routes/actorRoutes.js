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
const routeHandler_1 = require('../../../utils/routeHandler');
/**
 * Configure actor routes with the controller
 */
function configureActorRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { actorService, uploadService, postService, authService } =
    serviceContainer;
  if (!authService) {
    throw new Error(
      'AuthService not found in service container during actor route setup'
    );
  }
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
    void actorsController.searchActors(req, res).catch(next);
  });
  // Create new actor
  router.post('/', (req, res, next) => {
    void actorsController.createActor(req, res, next);
  });
  // Get actor posts
  router.get('/:username/posts', (req, res, next) => {
    void actorsController.getActorPosts(req, res, next);
  });
  // Get actor by username
  router.get('/:username', (req, res, next) => {
    void actorsController.getActorByUsername(req, res).catch(next);
  });
  // Update actor
  router.put(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(
      actorsController.updateActor.bind(actorsController)
    )
  );
  // Delete actor
  router.delete(
    '/:id',
    (0, auth_1.authenticate)(authService),
    (0, routeHandler_1.wrapAsync)(
      actorsController.deleteActor.bind(actorsController)
    )
  );
  return router;
}
