import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DbUser } from '../modules/auth/models/user';
import { AuthService } from '../modules/auth/services/auth.service';
import { Db } from 'mongodb';
import { ObjectId as _ObjectId } from 'mongodb';
import { AppError, ErrorType } from '../utils/errors';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate tokens - still used by auth service
export const generateToken = (user: DbUser): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.preferredUsername || user.username,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS256',
    }
  );
};

/**
 * @deprecated Use authenticate() instead which uses AuthService for secure DB lookups
 * This middleware directly accesses the DB collection and is less modular.
 *
 * SECURITY RISK: Do not use this middleware in new code.
 */
export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  logger.warn(
    {
      path: req.path,
      method: req.method,
      ip: req.ip,
    },
    'WARNING: Using deprecated auth() middleware. Please migrate to authenticate().'
  );

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

    if (!JWT_SECRET) {
      logger.error('JWT_SECRET environment variable is not defined');
      return res
        .status(500)
        .json({ error: 'Internal server configuration error' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as {
      id: string;
      username: string;
    };

    // Get database from app locals
    const db = req.app.locals.db as Db;

    if (!db) {
      logger.error('Database not found in app.locals');
      return res
        .status(500)
        .json({ error: 'Internal server configuration error' });
    }

    // Find user in database
    const user = await db.collection<DbUser>('actors').findOne({
      $or: [{ _id: decoded.id }, { preferredUsername: decoded.username }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user to request object
    req.user = user;

    next();
  } catch (__error) {
    logger.error({ err: __error }, 'Auth middleware error');
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (): ((
  req: Request,
  res: Response,
  next: NextFunction
) => void | Response) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    // Implementation depends on your role system
    next();
  };
};

declare module 'express' {
  interface Request {
    user?: DbUser;
  }
}

/**
 * @deprecated Use authenticate() instead which uses AuthService for secure DB lookups
 * This middleware does NOT verify the user exists in the database.
 *
 * SECURITY RISK: Do not use this middleware in new code.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  logger.warn(
    {
      path: req.path,
      method: req.method,
      ip: req.ip,
    },
    'WARNING: Using deprecated authenticateToken() middleware. Please migrate to authenticate().'
  );

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (!JWT_SECRET) {
    logger.error('JWT_SECRET environment variable is not defined');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as DbUser;
    req.user = decoded;
    next();
  } catch (_error) {
    logger.error({ err: _error }, 'Token verification failed');
    return res.status(403).json({ message: 'Invalid token' });
  }
};

/**
 * The recommended authentication middleware.
 * This middleware:
 * 1. Extracts the bearer token
 * 2. Verifies the token signature and expiration
 * 3. Uses AuthService to look up the user in the database
 * 4. Attaches the user to the request if valid
 *
 * @param authService The authentication service instance
 * @returns An Express middleware function
 */
export const authenticate = (
  authService: AuthService
): ((
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void | Response> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' });
      }

      const token = authHeader.split(' ')[1];

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
      if (error instanceof Error) {
        logger.error({ err: error, path: req.path }, 'Authentication error');
      }
      next(
        new AppError('Authentication failed', 401, ErrorType.AUTHENTICATION)
      );
    }
  };
};

/**
 * Middleware to check if a user is authenticated.
 * Use this after authenticate() when you need to enforce authentication
 * without extracting or verifying a token.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
