'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.engagementRateLimiter =
  exports.mediaUploadRateLimiter =
  exports.createPostRateLimiter =
  exports.authRateLimiter =
  exports.defaultRateLimiter =
    void 0;
const express_rate_limit_1 = __importDefault(require('express-rate-limit'));
const errors_1 = require('../utils/errors');
/**
 * Creates a rate limiter middleware for different API endpoints
 */
// Default rate limiter for general API endpoints
exports.defaultRateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Use draft-7 header format (RateLimit-*)
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    status: 'error',
    type: errors_1.ErrorType.RATE_LIMIT,
    message: 'Too many requests, please try again later',
  },
});
// More strict rate limiter for authentication endpoints
exports.authRateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login/register attempts per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: errors_1.ErrorType.RATE_LIMIT,
    message: 'Too many authentication attempts, please try again later',
  },
});
// Rate limiter for creating posts
exports.createPostRateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // Limit each IP to 20 posts per 5 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: errors_1.ErrorType.RATE_LIMIT,
    message: 'You are posting too frequently, please try again later',
  },
});
// Rate limiter for media uploads
exports.mediaUploadRateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 50, // Limit each IP to 50 uploads per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: errors_1.ErrorType.RATE_LIMIT,
    message: 'Too many file uploads, please try again later',
  },
});
// Rate limiter for post engagements (likes, shares, etc.)
exports.engagementRateLimiter = (0, express_rate_limit_1.default)({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // Limit each IP to 100 engagements per 5 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: errors_1.ErrorType.RATE_LIMIT,
    message: 'Too many interactions, please try again later',
  },
});
