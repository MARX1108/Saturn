import { z } from 'zod';
import {
  objectIdSchema,
  offsetPaginationQuerySchema,
  OffsetPaginationQueryType,
} from '../../shared/schemas/common.schemas';

/**
 * Schema for post ID URL parameter
 */
export const postIdParamSchema = z.object({
  id: objectIdSchema.refine(val => val, {
    message: 'Invalid post ID format',
  }),
});

/**
 * Schema for feed query parameters
 */
export const feedQuerySchema = offsetPaginationQuerySchema.extend({
  type: z.enum(['feed', 'local', 'all']).optional(),
});

// Define the output type for feed query
export type FeedQueryType = OffsetPaginationQueryType & {
  type?: 'feed' | 'local' | 'all';
};

/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
export const routeFeedQuerySchema = z.object({
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  type: z.enum(['feed', 'local', 'all']).optional(),
});

/**
 * Schema for username URL parameter
 */
export const usernameParamSchema = z.object({
  username: z.string().min(1).max(50),
});
