'use strict';
/**
 * Actors Module
 *
 * This module handles the creation, retrieval, updating, and deletion of actors (users).
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
exports.configureActorRoutes =
  exports.ActorRepository =
  exports.ActorService =
    void 0;
const actorService_1 = require('./services/actorService');
Object.defineProperty(exports, 'ActorService', {
  enumerable: true,
  get: function () {
    return actorService_1.ActorService;
  },
});
const actorRepository_1 = require('./repositories/actorRepository');
Object.defineProperty(exports, 'ActorRepository', {
  enumerable: true,
  get: function () {
    return actorRepository_1.ActorRepository;
  },
});
const actorRoutes_1 = __importDefault(require('./routes/actorRoutes'));
exports.configureActorRoutes = actorRoutes_1.default;
// Export controllers
__exportStar(require('./controllers/actorsController'), exports);
