import { z } from 'zod';
import {
  objectIdSchema,
  offsetPaginationQuerySchema,
} from '../../shared/schemas/common.schemas';

/**
 * Schema for post ID URL parameter
 */
export const postIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Schema for feed query parameters
 */
export const feedQuerySchema = offsetPaginationQuerySchema.extend({
  type: z.enum(['feed', 'local', 'all']).optional(),
});

/**
 * Schema for username URL parameter
 */
export const usernameParamSchema = z.object({
  username: z.string().min(1).max(50),
});
