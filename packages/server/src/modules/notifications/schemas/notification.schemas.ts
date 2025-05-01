import { z } from 'zod';
import {
  offsetPaginationQuerySchema,
  objectIdSchema,
  OffsetPaginationQueryType,
} from '../../shared/schemas/common.schemas';

/**
 * Schema for notification ID URL parameter
 */
export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * Schema for notifications query parameters
 */
export const notificationsQuerySchema = offsetPaginationQuerySchema.extend({
  type: z.enum(['all', 'likes', 'comments', 'follows', 'mentions']).optional(),
  read: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

// Define the output type for notifications query
export type NotificationsQueryType = OffsetPaginationQueryType & {
  type?: 'all' | 'likes' | 'comments' | 'follows' | 'mentions';
  read?: boolean;
};

/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
export const routeNotificationsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine(
      val => {
        if (!val) return true;
        return /^\d+$/.test(val);
      },
      {
        message: 'Page must be a valid number',
      }
    )
    .transform(val => (val && /^\d+$/.test(val) ? parseInt(val, 10) : 1)),
  offset: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  type: z.enum(['all', 'likes', 'comments', 'follows', 'mentions']).optional(),
  read: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
});

/**
 * Schema for marking notifications as read
 */
export const markReadSchema = z.object({
  ids: z.array(objectIdSchema),
});
