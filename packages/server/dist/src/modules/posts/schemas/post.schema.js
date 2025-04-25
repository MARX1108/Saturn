'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.updatePostSchema =
  exports.createPostSchema =
  exports.attachmentSchema =
    void 0;
const zod_1 = require('zod');
// Schema for attachment validation
exports.attachmentSchema = zod_1.z.object({
  url: zod_1.z.string().url('Attachment URL must be a valid URL'),
  type: zod_1.z.enum(['Image', 'Video', 'Document', 'Audio'], {
    errorMap: () => ({
      message: 'Attachment type must be Image, Video, Document, or Audio',
    }),
  }),
  mediaType: zod_1.z.string(),
  name: zod_1.z.string().optional(),
  width: zod_1.z.number().positive().optional(),
  height: zod_1.z.number().positive().optional(),
  blurhash: zod_1.z.string().optional(),
});
// Schema for creating a post
exports.createPostSchema = zod_1.z.object({
  content: zod_1.z.string().min(1, 'Content is required'),
  visibility: zod_1.z
    .enum(['public', 'followers', 'unlisted', 'direct'], {
      errorMap: () => ({
        message: 'Visibility must be public, followers, unlisted, or direct',
      }),
    })
    .optional(),
  sensitive: zod_1.z.boolean().optional(),
  summary: zod_1.z.string().optional(),
  attachments: zod_1.z.array(exports.attachmentSchema).optional(),
});
// Schema for updating a post
exports.updatePostSchema = zod_1.z
  .object({
    content: zod_1.z.string().min(1, 'Content is required').optional(),
    visibility: zod_1.z
      .enum(['public', 'followers', 'unlisted', 'direct'], {
        errorMap: () => ({
          message: 'Visibility must be public, followers, unlisted, or direct',
        }),
      })
      .optional(),
    sensitive: zod_1.z.boolean().optional(),
    summary: zod_1.z.string().optional(),
    attachments: zod_1.z.array(exports.attachmentSchema).optional(),
  })
  // Check that at least one field is provided as middleware
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: zod_1.z.ZodIssueCode.custom,
        message: 'At least one field must be provided for update',
      });
    }
  });
