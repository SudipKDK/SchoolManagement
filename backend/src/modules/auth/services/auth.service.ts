import crypto from 'node:crypto';
import { AppError } from '../../../utils/AppError.js';
import * as authRepo from '../repositories/auth.repositories.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../utils/jwt.js';
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

export async function refresh(rawToken?: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!rawToken) {
    throw new AppError('UNAUTHORIZED', 'Refresh token is required', 401);
  }

  // 1. Verify cryptographic validity
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401);
  }

  // 2. Verify token exists in database (tracking and revocation check)
  const storedToken = await authRepo.findRefreshToken(rawToken);
  if (!storedToken) {
    throw new AppError('UNAUTHORIZED', 'Refresh token has been revoked or is invalid', 401);
  }

  // 3. Verify user matches payload
  if (storedToken.userId !== payload.id) {
    throw new AppError('UNAUTHORIZED', 'Invalid token identity', 401);
  }

  // 4. Verify token is not expired in DB
  if (new Date() > storedToken.expiresAt) {
    await authRepo.deleteRefreshToken(rawToken);
    throw new AppError('UNAUTHORIZED', 'Refresh token has expired', 401);
  }

  // 5. Issue new access token and rotated refresh token
  const newAccessToken = generateAccessToken({ id: storedToken.userId });
  const newRefreshToken = generateRefreshToken({ id: storedToken.userId });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 6. Atomically rotate the refresh token
  await authRepo.rotateRefreshToken(rawToken, {
    userId: storedToken.userId,
    token: newRefreshToken,
    expiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(rawToken?: string): Promise<void> {
  if (!rawToken) return;

  try {
    await authRepo.deleteRefreshToken(rawToken);
  } catch {
    // If token does not exist or was already deleted, ignore safely
  }
}

export async function getMe(userId: string) {
  const user = await authRepo.findUserWithRoles(userId);
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    roles: user.roles.map((r) => ({
      role: r.role.name,
      schoolId: r.schoolId,
      schoolName: r.school?.name ?? null,
      permissions: r.role.permissions.map((p) => p.permission),
    })),
  };
}

