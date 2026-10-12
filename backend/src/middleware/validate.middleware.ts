import type { Request, Response, NextFunction } from 'express';
import type { Schema } from 'zod';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

/**
 * Generic Validation Middleware
 * 
 * Takes a Zod schema and validates the incoming request (body, query, params).
 * If validation fails, it throws a 400 AppError with detailed field errors.
 */
export const validate =
  (schema: Schema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to a readable format
        const errorMessage = error.issues
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        
        // Pass to our global errorHandler via next()
        return next(new AppError('VALIDATION_ERROR', errorMessage, 400));
      }
      return next(error);
    }
  };
