import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError.js';
import { verifyAccessToken } from '../../utils/jwt.js';

/**
 * Authentication Middleware (Who are you?)
 * 
 * Intercepts requests, checks for a valid JWT in the Authorization header,
 * and attaches the decoded user ID to the request object.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHENTICATED', 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('UNAUTHENTICATED', 'Token missing', 401);
    }

    // This will throw an error if the token is expired or tampered with
    const payload = verifyAccessToken(token);
    
    // Attach user to the request object so downstream controllers/middlewares can use it
    req.user = { id: payload.id };
    
    next();
  } catch (error) {
    next(error);
  }
};
