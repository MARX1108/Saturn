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
/**
 * Configure and mount all application routes
 */
function configureRoutes(serviceContainer) {
  const router = express_1.default.Router();
  router.use('/auth', (0, authRoutes_1.default)(serviceContainer));
  router.use('/posts', (0, postRoutes_1.default)(serviceContainer));
  router.use('/actors', (0, actorRoutes_1.default)(serviceContainer));
  return router;
}
exports.default = configureRoutes;
