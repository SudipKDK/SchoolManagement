import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError.js';

/**
 * Tenant Context Middleware (Which school are you operating on?)
 * 
 * Ensures the client explicitly provides the school they want to interact with.
 * Note: This only sets the CONTEXT. The actual security check of "Does this user
 * have permission in this school?" is deferred to the `authorize` middleware.
 */
export const requireSchool = (req: Request, _res: Response, next: NextFunction) => {
  const schoolId = req.headers['x-school-id'];

  if (!schoolId || typeof schoolId !== 'string') {
    return next(
      new AppError(
        'BAD_REQUEST', 
        'Missing or invalid x-school-id header. You must specify which school you are accessing.', 
        400
      )
    );
  }

  // Attach the tenant context to the request
  req.schoolId = schoolId;
  next();
};
