import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { User } from '@shared/schema';

const JWT_SECRET = process.env.JWT_SECRET || 'elisa-quantum-ai-council-secret';
const JWT_EXPIRES_IN = '24h';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userId?: string;
}

// Generate JWT token
export function generateToken(userId: string, email?: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Authentication middleware
export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Check if token is blacklisted
  const session = await storage.getSession(token);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const user = await storage.getUser(decoded.userId);
  if (!user || !user.isActive) {
    return res.status(401).json({ message: 'User not found or inactive' });
  }

  req.user = user;
  req.userId = user.id;
  next();
}

// Admin role middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// Super admin role middleware
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
}

// ELISA ownership verification middleware
export function requireELISAOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const allowedEmails = ['ervin210@icloud.com', 'radosavlevici.ervin@gmail.com'];
  
  if (!req.user || !allowedEmails.includes(req.user.email)) {
    // Log unauthorized access attempt
    storage.createAuditLog({
      userId: req.user?.id || null,
      action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
      resource: 'ELISA_SYSTEM',
      details: { 
        email: req.user?.email,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      }
    });

    return res.status(403).json({ 
      message: 'ELISA system access restricted to authorized personnel only',
      code: 'ELISA_ACCESS_DENIED'
    });
  }
  next();
}

// Rate limiting for authentication attempts
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
};