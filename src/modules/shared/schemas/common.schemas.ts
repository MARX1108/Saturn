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
    } catch (error) {
      return false;
    }
  },
  {
    message: 'Invalid ObjectId format',
  }
);

/**
 * Schema for pagination query parameters
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .refine(val => val >= 1, {
      message: 'Page must be a positive integer',
    }),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .refine(val => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});

/**
 * Schema for offset-based pagination query parameters
 */
export const offsetPaginationQuerySchema = z.object({
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0))
    .refine(val => val >= 0, {
      message: 'Offset must be a non-negative integer',
    }),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10))
    .refine(val => val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
});
