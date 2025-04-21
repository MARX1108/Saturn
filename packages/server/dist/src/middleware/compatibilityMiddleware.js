'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.compatibilityMiddleware = void 0;
/**
 * Middleware to inject services into request object for backward compatibility
 * This maintains compatibility with older code that expects services directly on the request object
 */
const compatibilityMiddleware = (req, res, next) => {
  // We no longer need to assign actorService to req
  // Code using req.actorService should now use req.services.actorService
  // This middleware can be deprecated and eventually removed
  // as all code is updated to use the services container directly
  next();
};
exports.compatibilityMiddleware = compatibilityMiddleware;
