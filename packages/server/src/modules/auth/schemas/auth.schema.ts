import { z } from 'zod';

// Schema for user registration
export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

// Schema for user login
export const loginSchema = z.object({
  body: z.object({
    // Using email for login is standard, controller currently uses username
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'), // Minimal validation
  }),
});

// Export types inferred from schemas if needed elsewhere (optional)
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
