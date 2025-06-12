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
const routeHandler_1 = require('../../../utils/routeHandler');
const httpSignature_1 = require('../../../middleware/httpSignature');
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
  router.get(
    '/users/:username',
    (0, routeHandler_1.wrapAsync)(async (req, res, _next) => {
      return activityPubController.getActor(req, res);
    })
  );
  // Actor inbox - where activities from other servers arrive
  router.post(
    '/users/:username/inbox',
    express_1.default.json(),
    httpSignature_1.verifyHttpSignature,
    (0, routeHandler_1.wrapAsync)(async (req, res, _next) => {
      return activityPubController.receiveActivity(req, res);
    })
  );
  // Actor outbox - collection of activities by this user
  router.get(
    '/users/:username/outbox',
    (0, routeHandler_1.wrapAsync)(async (req, res, _next) => {
      return activityPubController.getOutbox(req, res);
    })
  );
  return router;
}
