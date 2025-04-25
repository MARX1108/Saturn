'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.serviceMiddleware = void 0;
/**
 * Middleware factory to inject the service container onto the request object.
 */
const serviceMiddleware = container => {
  return (req, res, next) => {
    try {
      // Assign the container to req.services with type assertion
      req.services = container;
      next();
    } catch (error) {
      // Catch potential errors during assignment
      next(error);
    }
  };
};
exports.serviceMiddleware = serviceMiddleware;
