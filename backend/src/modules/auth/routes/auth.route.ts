import { Router } from 'express';
import { validate } from '../../../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const authRouter = Router();


//  * POST /api/v1/auth/register
//  * 1. validate(registerSchema) ensures req.body is perfect.
//  * 2. authController.registerHandler executes the logic.

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

export { authRouter };
