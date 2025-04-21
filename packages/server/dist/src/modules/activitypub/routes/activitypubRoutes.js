'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureActivityPubRoutes = configureActivityPubRoutes;
const express_1 = __importDefault(require('express'));
const activitypubController_1 = require('../controllers/activitypubController');
/**
 * Configure ActivityPub routes with the controller
 */
function configureActivityPubRoutes(serviceContainer) {
  const router = express_1.default.Router();
  const { actorService, activityPubService } = serviceContainer;
  const domain = process.env.DOMAIN || 'localhost:4000';
  // Create controller with injected dependencies
  const activityPubController =
    new activitypubController_1.ActivityPubController(
      actorService,
      activityPubService,
      domain
    );
  // Get ActivityPub actor profile (federated)
  router.get('/users/:username', (req, res, next) => {
    activityPubController.getActor(req, res).catch(next);
  });
  // Actor inbox - where activities from other servers arrive
  router.post(
    '/users/:username/inbox',
    express_1.default.json(),
    (req, res, next) => {
      activityPubController.receiveActivity(req, res).catch(next);
    }
  );
  // Actor outbox - collection of activities by this user
  router.get('/users/:username/outbox', (req, res, next) => {
    activityPubController.getOutbox(req, res).catch(next);
  });
  return router;
}
