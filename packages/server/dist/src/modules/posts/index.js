'use strict';
/**
 * Posts Module
 *
 * This module handles the creation, retrieval, updating, and deletion of posts.
 */
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.postsRoutes = void 0;
// Export controllers
__exportStar(require('./controllers/postsController'), exports);
// Export routes
var postRoutes_1 = require('./routes/postRoutes');
Object.defineProperty(exports, 'postsRoutes', {
  enumerable: true,
  get: function () {
    return __importDefault(postRoutes_1).default;
  },
});
// Export models
__exportStar(require('./models/post'), exports);
// Export services
__exportStar(require('./services/postService'), exports);
// Export repositories
__exportStar(require('./repositories/postRepository'), exports);
