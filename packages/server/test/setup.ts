// Global setup for Jest tests
process.env.NODE_ENV = "test";
process.env.DOMAIN = "localhost:4000";

// Add Jest specific setup
jest.setTimeout(10000); // 10 second timeout
