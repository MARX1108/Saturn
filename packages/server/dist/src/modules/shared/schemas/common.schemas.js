'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.offsetPaginationQuerySchema =
  exports.paginationQuerySchema =
  exports.objectIdSchema =
    void 0;
const zod_1 = require('zod');
const mongodb_1 = require('mongodb');
/**
 * Schema to validate MongoDB ObjectId format
 */
exports.objectIdSchema = zod_1.z.string().refine(
  id => {
    try {
      // Try to create a new ObjectId to validate format
      new mongodb_1.ObjectId(id);
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid ID format',
  }
);
/**
 * Schema for pagination query parameters (page-based)
 */
exports.paginationQuerySchema = zod_1.z.object({
  page: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(
      zod_1.z.number().int().min(1, {
        message: 'Page must be a positive integer',
      })
    ),
  limit: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .pipe(
      zod_1.z.number().int().min(1).max(100, {
        message: 'Limit must be between 1 and 100',
      })
    ),
});
/**
 * Schema for offset-based pagination query parameters
 */
exports.offsetPaginationQuerySchema = zod_1.z.object({
  offset: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .pipe(
      zod_1.z.number().int().min(0, {
        message: 'Offset must be a non-negative integer',
      })
    ),
  limit: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .pipe(
      zod_1.z.number().int().min(1).max(100, {
        message: 'Limit must be between 1 and 100',
      })
    ),
});
