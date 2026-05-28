import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vibe-miner-shop-secret-key-2024';

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; username: string };
}

export const generateToken = (user: { id: number; email: string; role: string; username: string }) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role, username: decoded.username };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
