'use strict';
/**
 * WebFinger Module
 *
 * This module handles WebFinger protocol implementation for actor discovery.
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
exports.webfingerRoutes = void 0;
// Export controllers
__exportStar(require('./controllers/webfingerController'), exports);
// Export routes
var webfingerRoutes_1 = require('./routes/webfingerRoutes');
Object.defineProperty(exports, 'webfingerRoutes', {
  enumerable: true,
  get: function () {
    return __importDefault(webfingerRoutes_1).default;
  },
});
// Export services if they exist
// export * from './services/webfingerService';
// Export repositories if they exist
// export * from './repositories/webfingerRepository';
