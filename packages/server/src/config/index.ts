import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

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
    avatarDir: path.join(process.cwd(), 'public', 'avatars'),
    mediaDir: path.join(process.cwd(), 'public', 'media'),
    tempDir: path.join(process.cwd(), 'uploads'),
    maxSize: {
      avatar: 5 * 1024 * 1024, // 5MB
      media: 10 * 1024 * 1024, // 10MB
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};

export default config;
