import { z } from 'zod';
import { ObjectId } from 'mongodb';

/**
 * Schema to validate MongoDB ObjectId format
 */
export const objectIdSchema = z.string().refine(
  id => {
    try {
      // Try to create a new ObjectId to validate format
      new ObjectId(id);
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
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .pipe(
      z.number().int().min(1, {
        message: 'Page must be a positive integer',
      })
    ),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .pipe(
      z.number().int().min(1).max(100, {
        message: 'Limit must be between 1 and 100',
      })
    ),
});

// Explicitly define the return type after transformation
export type PaginationQueryType = {
  page: number;
  limit: number;
};

/**
 * Schema for offset-based pagination query parameters
 */
export const offsetPaginationQuerySchema = z.object({
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .pipe(
      z.number().int().min(0, {
        message: 'Offset must be a non-negative integer',
      })
    ),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .pipe(
      z.number().int().min(1).max(100, {
        message: 'Limit must be between 1 and 100',
      })
    ),
});

// Explicitly define the return type after transformation
export type OffsetPaginationQueryType = {
  offset: number;
  limit: number;
};
