import { z } from 'zod';

// Schema for user registration body
export const registerBodySchema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must be at most 30 characters long'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must be at most 100 characters long'),
  })
  .passthrough(); // Allow extra fields like displayName, bio

// Schema for user login body
export const loginBodySchema = z.object({
  // Using username for login to match controller/test state
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// Export types inferred from schemas if needed elsewhere (optional)
export type RegisterInput = z.infer<typeof registerBodySchema>;
export type LoginInput = z.infer<typeof loginBodySchema>;
