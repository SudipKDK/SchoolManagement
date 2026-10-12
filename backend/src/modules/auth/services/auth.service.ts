import crypto from 'node:crypto';
import { AppError } from '../../../utils/AppError.js';
import * as authRepo from '../repositories/auth.repositories.js';
import { generateAccessToken, generateRefreshToken } from '../../../utils/jwt.js';
import type { RegisterInput, LoginInput } from '../validators/auth.validator.js';
import type { AuthResult } from '../types/auth.types.js';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return key === hash;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  // 1. Check if email is already in use
  const existingUser = await authRepo.findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError('USER_EXISTS', 'Email is already registered', 409);
  }

  // 2. Hash password (business logic)
  const passwordHash = hashPassword(input.password);

  // 3. Create user in DB
  const user = await authRepo.createUser({
    email: input.email,
    passwordHash,
  });

  // 4. Generate tokens
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });
  
  // 5. Store refresh token in DB for tracking/revocation (expires in 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
  
  await authRepo.createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  // 6. Return safe representation
  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    tokens: { accessToken, refreshToken },
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  // 1. Find user by email
  const user = await authRepo.findUserByEmail(input.email);
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401);
  }

  // 2. Verify password
  const isPasswordValid = verifyPassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password', 401);
  }

  // 3. Generate new tokens
  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 4. Persist refresh token
  await authRepo.createRefreshToken({
    userId: user.id,
    token: refreshToken,
    expiresAt,
  });

  return {
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    tokens: { accessToken, refreshToken },
  };
}
