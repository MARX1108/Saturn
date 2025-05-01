import { z } from 'zod';
import {
  objectIdSchema,
  offsetPaginationQuerySchema,
} from '../../shared/schemas/common.schemas';

/**
 * Schema for comment ID URL parameter
 */
export const commentIdParamSchema = z.object({
  commentId: objectIdSchema,
});

/**
 * Schema for post ID URL parameter in the context of comments
 */
export const postIdParamSchema = z.object({
  postId: objectIdSchema,
});

/**
 * Schema for comments query parameters
 */
export const commentsQuerySchema = offsetPaginationQuerySchema.extend({
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
});
