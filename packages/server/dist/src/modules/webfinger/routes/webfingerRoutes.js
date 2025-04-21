'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = configureWebFingerRoutes;
const express_1 = __importDefault(require('express'));
const webfingerController_1 = require('../controllers/webfingerController');
/**
 * Configure WebFinger routes with the controller
 */
function configureWebFingerRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { actorService, webfingerService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';
  // Create controller with injected dependencies
  const webFingerController = new webfingerController_1.WebFingerController(
    actorService,
    webfingerService,
    domain
  );
  // WebFinger endpoint for actor discovery
  router.get('/.well-known/webfinger', (req, res, next) => {
    // Use type assertion to satisfy the controller's type requirement
    webFingerController.getResource(req, res).catch(next);
  });
  return router;
}
