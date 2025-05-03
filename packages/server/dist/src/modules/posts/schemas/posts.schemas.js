'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.usernameParamSchema =
  exports.routeFeedQuerySchema =
  exports.feedQuerySchema =
  exports.postIdParamSchema =
    void 0;
const zod_1 = require('zod');
const common_schemas_1 = require('../../shared/schemas/common.schemas');
/**
 * Schema for post ID URL parameter
 */
exports.postIdParamSchema = zod_1.z.object({
  id: common_schemas_1.objectIdSchema.refine(val => val, {
    message: 'Invalid post ID format',
  }),
});
/**
 * Schema for feed query parameters
 */
exports.feedQuerySchema = common_schemas_1.offsetPaginationQuerySchema.extend({
  type: zod_1.z.enum(['feed', 'local', 'all']).optional(),
});
/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
exports.routeFeedQuerySchema = zod_1.z.object({
  offset: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  type: zod_1.z.enum(['feed', 'local', 'all']).optional(),
});
/**
 * Schema for username URL parameter
 */
exports.usernameParamSchema = zod_1.z.object({
  username: zod_1.z.string().min(1).max(50),
});
