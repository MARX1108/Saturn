'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.routeCommentsQuerySchema =
  exports.commentsQuerySchema =
  exports.postIdParamSchema =
  exports.commentIdParamSchema =
    void 0;
const zod_1 = require('zod');
const common_schemas_1 = require('../../shared/schemas/common.schemas');
/**
 * Schema for comment ID URL parameter
 */
exports.commentIdParamSchema = zod_1.z.object({
  commentId: common_schemas_1.objectIdSchema,
});
/**
 * Schema for post ID URL parameter in the context of comments
 */
exports.postIdParamSchema = zod_1.z.object({
  postId: common_schemas_1.objectIdSchema,
});
/**
 * Schema for comments query parameters
 */
exports.commentsQuerySchema =
  common_schemas_1.offsetPaginationQuerySchema.extend({
    sort: zod_1.z.enum(['newest', 'oldest', 'popular']).optional(),
  });
/**
 * Schema for route validation with explicit output type
 * This is a new schema that directly specifies the output types
 */
exports.routeCommentsQuerySchema = zod_1.z.object({
  offset: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 0)),
  limit: zod_1.z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 10)),
  sort: zod_1.z.enum(['newest', 'oldest', 'popular']).optional(),
});
