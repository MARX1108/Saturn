import { z } from 'zod';
import {
  objectIdSchema,
  offsetPaginationQuerySchema,
  OffsetPaginationQueryType,
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

// Define the output type for comments query
export type CommentsQueryType = OffsetPaginationQueryType & {
  sort?: 'newest' | 'oldest' | 'popular';
};

/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
export const routeCommentsQuerySchema = z.object({
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  sort: z.enum(['newest', 'oldest', 'popular']).optional(),
});
