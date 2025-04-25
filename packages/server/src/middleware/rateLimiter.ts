import rateLimit from 'express-rate-limit';
import { AppError as _AppError, ErrorType } from '../utils/errors';

/**
 * Creates a rate limiter middleware for different API endpoints
 */

// Default rate limiter for general API endpoints
export const defaultRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Use draft-7 header format (RateLimit-*)
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    status: 'error',
    type: ErrorType.RATE_LIMIT,
    message: 'Too many requests, please try again later',
  },
});

// More strict rate limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 login/register attempts per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: ErrorType.RATE_LIMIT,
    message: 'Too many authentication attempts, please try again later',
  },
});

// Rate limiter for creating posts
export const createPostRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 20, // Limit each IP to 20 posts per 5 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: ErrorType.RATE_LIMIT,
    message: 'You are posting too frequently, please try again later',
  },
});

// Rate limiter for media uploads
export const mediaUploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 50, // Limit each IP to 50 uploads per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: ErrorType.RATE_LIMIT,
    message: 'Too many file uploads, please try again later',
  },
});

// Rate limiter for post engagements (likes, shares, etc.)
export const engagementRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100, // Limit each IP to 100 engagements per 5 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    status: 'error',
    type: ErrorType.RATE_LIMIT,
    message: 'Too many interactions, please try again later',
  },
});
