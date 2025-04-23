// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DOMAIN = 'test.domain';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.PORT = '4000';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
process.env.DISABLE_RATE_LIMITS = 'true';
