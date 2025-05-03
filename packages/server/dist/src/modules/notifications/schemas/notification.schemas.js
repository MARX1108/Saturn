'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.markReadSchema =
  exports.routeNotificationsQuerySchema =
  exports.notificationsQuerySchema =
  exports.notificationIdParamSchema =
    void 0;
const zod_1 = require('zod');
const common_schemas_1 = require('../../shared/schemas/common.schemas');
/**
 * Schema for notification ID URL parameter
 */
exports.notificationIdParamSchema = zod_1.z.object({
  id: common_schemas_1.objectIdSchema,
});
/**
 * Schema for notifications query parameters
 */
exports.notificationsQuerySchema =
  common_schemas_1.offsetPaginationQuerySchema.extend({
    type: zod_1.z
      .enum(['all', 'likes', 'comments', 'follows', 'mentions'])
      .optional(),
    read: zod_1.z
      .string()
      .optional()
      .transform(val => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      }),
  });
/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
exports.routeNotificationsQuerySchema = zod_1.z.object({
  page: zod_1.z
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
  offset: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  type: zod_1.z
    .enum(['all', 'likes', 'comments', 'follows', 'mentions'])
    .optional(),
  read: zod_1.z
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
exports.markReadSchema = zod_1.z.object({
  ids: zod_1.z.array(common_schemas_1.objectIdSchema),
});
