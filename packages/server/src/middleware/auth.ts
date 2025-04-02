import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Db } from "mongodb";

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
      db?: Db;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const generateToken = (user: any): string => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.preferredUsername || user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization header required" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
    };

    // Get database from app locals
    const db = req.app.locals.db;

    // Find user in database
    const user = await db.collection("actors").findOne({
      $or: [{ _id: decoded.id }, { preferredUsername: decoded.username }],
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Add user to request object
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const authorize = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Implementation depends on your role system
    next();
  };
};

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
    const user = jwt.verify(token, jwtSecret) as {
      id: string;
      username: string;
    };
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
