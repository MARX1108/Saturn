'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.asyncHandler = void 0;
/**
 * Utility for safely wrapping async Express route handlers
 * This wrapper ensures proper Promise handling and error propagation
 */
const asyncHandler = fn => (req, res, next) => {
  void Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
