'use strict';
/**
 * Auth Module
 *
 * This module handles user authentication, registration, and authorization.
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
exports.configureAuthRoutes = void 0;
// Export controllers
__exportStar(require('./controllers/authController'), exports);
// Export routes configuration
var authRoutes_1 = require('./routes/authRoutes');
Object.defineProperty(exports, 'configureAuthRoutes', {
  enumerable: true,
  get: function () {
    return __importDefault(authRoutes_1).default;
  },
});
// Export models
__exportStar(require('./models/auth'), exports);
// Export services when they exist
// export * from './services/authService';
// Export repositories when they exist
// export * from './repositories/authRepository';
