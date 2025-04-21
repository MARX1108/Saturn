'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const dotenv_1 = __importDefault(require('dotenv'));
const path_1 = __importDefault(require('path'));
// Load .env file
dotenv_1.default.config();
const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/saturn',
  },
  domain: process.env.DOMAIN || 'localhost:4000',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  uploads: {
    avatarDir: path_1.default.join(process.cwd(), 'public', 'avatars'),
    mediaDir: path_1.default.join(process.cwd(), 'public', 'media'),
    tempDir: path_1.default.join(process.cwd(), 'uploads'),
    maxSize: {
      avatar: 5 * 1024 * 1024, // 5MB
      media: 10 * 1024 * 1024, // 10MB
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
exports.default = config;
