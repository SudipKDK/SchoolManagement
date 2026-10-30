import { Router } from 'express';
import { validate } from '../../../middleware/validate.middleware.js';
import { requireAuth } from '../../../middleware/auth/requireAuth.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post(
  '/register',
  validate(registerSchema),
  authController.registerHandler
);

// POST /api/v1/auth/login
authRouter.post(
  '/login',
  validate(loginSchema),
  authController.loginHandler
);

// POST /api/v1/auth/refresh
authRouter.post(
  '/refresh',
  authController.refreshHandler
);

// POST /api/v1/auth/logout
authRouter.post(
  '/logout',
  authController.logoutHandler
);

// GET /api/v1/auth/me
authRouter.get(
  '/me',
  requireAuth,
  authController.getMeHandler
);

export { authRouter };

