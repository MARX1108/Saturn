'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.requireAuth =
  exports.authenticate =
  exports.authenticateToken =
  exports.authorize =
  exports.auth =
  exports.generateToken =
    void 0;
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const generateToken = user => {
  return jsonwebtoken_1.default.sign(
    {
      id: user._id || user.id,
      username: user.preferredUsername || user.username,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
exports.generateToken = generateToken;
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header required' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    // Verify token
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    // Get database from app locals
    const db = req.app.locals.db;
    if (!db) {
      console.error('Database not found in app.locals');
      return res
        .status(500)
        .json({ error: 'Internal server configuration error' });
    }
    // Find user in database
    const user = await db.collection('actors').findOne({
      $or: [{ _id: decoded.id }, { preferredUsername: decoded.username }],
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    // Add user to request object
    req.user = user;
    next();
  } catch (_error) {
    console.error('Auth middleware error:', _error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
exports.auth = auth;
const authorize = () => {
  return (req, res, next) => {
    // Implementation depends on your role system
    next();
  };
};
exports.authorize = authorize;
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jsonwebtoken_1.default.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    );
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};
exports.authenticateToken = authenticateToken;
const authenticate = authService => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const user = await authService.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};
exports.authenticate = authenticate;
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
exports.requireAuth = requireAuth;
