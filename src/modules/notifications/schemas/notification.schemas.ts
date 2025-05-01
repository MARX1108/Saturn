import { z } from 'zod';
import {
  offsetPaginationQuerySchema,
  objectIdSchema,
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

/**
 * Schema for marking notifications as read
 */
export const markReadSchema = z.object({
  ids: z.array(objectIdSchema),
});
