'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.wrapAsync = wrapAsync;
/**
 * Safely wraps an async controller method for use in Express route handlers
 * Addresses the ESLint no-misused-promises error by properly handling Promise returns
 *
 * @param fn The async controller function to wrap
 * @returns A void function safe to use in Express routes
 */
// Using a special typing to make ESLint happy with this function
function wrapAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
