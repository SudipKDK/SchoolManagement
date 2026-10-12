import type { Request, Response } from 'express';
import { catchAsync } from '../../../utils/catchAsync.utils.js';
import * as authService from '../services/auth.service.js';
import { env } from '../../../config/env.js';

/**
 * Register Handler
 * Notice how thin this is. It just extracts data, calls the service, and formats the response.
 */
export const registerHandler = catchAsync(async (req: Request, res: Response) => {
  // req.body is fully validated by our middleware at this point
  const result = await authService.register(req.body);

  // Set the refresh token securely in an httpOnly cookie
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Return the safe user object and short-lived access token
  res.status(201).json({
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});

// Login Handler

export const loginHandler = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
});
