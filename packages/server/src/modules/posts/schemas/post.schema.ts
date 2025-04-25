import { z } from 'zod';

// Schema for attachment validation
export const attachmentSchema = z.object({
  url: z.string().url('Attachment URL must be a valid URL'),
  type: z.enum(['Image', 'Video', 'Document', 'Audio'], {
    errorMap: () => ({
      message: 'Attachment type must be Image, Video, Document, or Audio',
    }),
  }),
  mediaType: z.string(),
  name: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  blurhash: z.string().optional(),
});

// Schema for creating a post
export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  visibility: z
    .enum(['public', 'followers', 'unlisted', 'direct'], {
      errorMap: () => ({
        message: 'Visibility must be public, followers, unlisted, or direct',
      }),
    })
    .optional(),
  sensitive: z.boolean().optional(),
  summary: z.string().optional(),
  attachments: z.array(attachmentSchema).optional(),
});

// Schema for updating a post
export const updatePostSchema = z
  .object({
    content: z.string().min(1, 'Content is required').optional(),
    visibility: z
      .enum(['public', 'followers', 'unlisted', 'direct'], {
        errorMap: () => ({
          message: 'Visibility must be public, followers, unlisted, or direct',
        }),
      })
      .optional(),
    sensitive: z.boolean().optional(),
    summary: z.string().optional(),
    attachments: z.array(attachmentSchema).optional(),
  })
  // Check that at least one field is provided as middleware
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided for update',
      });
    }
  });
