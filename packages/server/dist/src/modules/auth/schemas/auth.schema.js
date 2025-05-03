'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.loginBodySchema = exports.registerBodySchema = void 0;
const zod_1 = require('zod');
// Schema for user registration body
exports.registerBodySchema = zod_1.z
  .object({
    username: zod_1.z
      .string()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username must be at most 30 characters long'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(100, 'Password must be at most 100 characters long'),
  })
  .passthrough(); // Allow extra fields like displayName, bio
// Schema for user login body
exports.loginBodySchema = zod_1.z.object({
  // Using username for login to match controller/test state
  username: zod_1.z.string().min(1, 'Username is required'),
  password: zod_1.z.string().min(1, 'Password is required'),
});
