'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.commentParamsSchema = exports.createCommentBodySchema = void 0;
const zod_1 = require('zod');
// Basic ObjectId check (24 hex characters)
const objectIdSchema = zod_1.z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
// Schema for creating a comment body
exports.createCommentBodySchema = zod_1.z.object({
  content: zod_1.z.string().min(1, 'Comment content cannot be empty'),
});
// Schema for comment ID parameter (useful elsewhere)
exports.commentParamsSchema = zod_1.z.object({
  commentId: objectIdSchema,
});
