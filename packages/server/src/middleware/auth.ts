import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DbUser } from '../modules/auth/models/user';
import { AuthService } from '../modules/auth/services/auth.service';
import { Db } from 'mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (user: DbUser): string => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.preferredUsername || user.username,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
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
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };

    // Get database from app locals
    const db = req.app.locals.db as Db;

    if (!db) {
      console.error('Database not found in app.locals');
      return res
        .status(500)
        .json({ error: 'Internal server configuration error' });
    }

    // Find user in database
    const user = await db.collection<DbUser>('actors').findOne({
      $or: [
        { _id: new ObjectId(decoded.id) },
        { preferredUsername: decoded.username },
      ],
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

export const authorize = () => {
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

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as DbUser;
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authenticate = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
