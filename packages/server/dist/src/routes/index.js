'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.configureRoutes = configureRoutes;
const express_1 = __importDefault(require('express'));
const authRoutes_1 = __importDefault(
  require('../modules/auth/routes/authRoutes')
);
const postRoutes_1 = __importDefault(
  require('../modules/posts/routes/postRoutes')
);
const actorRoutes_1 = __importDefault(
  require('../modules/actors/routes/actorRoutes')
);
const comment_routes_1 = __importDefault(
  require('../modules/comments/routes/comment.routes')
);
const notification_routes_1 = require('../modules/notifications/routes/notification.routes');
/**
 * Configure and mount all application routes
 */
function configureRoutes(serviceContainer) {
  const router = express_1.default.Router();
  router.use('/auth', (0, authRoutes_1.default)(serviceContainer));
  router.use('/posts', (0, postRoutes_1.default)(serviceContainer));
  router.use('/actors', (0, actorRoutes_1.default)(serviceContainer));
  // Add notification routes
  router.use(
    '/notifications',
    (0, notification_routes_1.configureNotificationRoutes)(serviceContainer)
  );
  // Add comment routes
  router.use('/comments', (0, comment_routes_1.default)(serviceContainer));
  return router;
}
exports.default = configureRoutes;
