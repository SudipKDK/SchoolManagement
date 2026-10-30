/**
 * Auth Repository
 *
 * WHY THIS FILE EXISTS (Repository Pattern):
 * This is the ONLY place in the auth module that imports Prisma.
 * Every DB query is a small, named function. This means:
 *  - The Service calls findUserByEmail(), not prisma.user.findUnique(...)
 *  - If we switch databases, only this file changes
 *  - Each function is independently unit-testable by mocking
 *
 * Convention: functions are named from the domain's perspective,
 * not the database's. "findUserByEmail" not "userFindUnique".
 */

import { prisma } from "../../../lib/prisma.js";
import type { User, RefreshToken } from "../../../generated/prisma/client.js";

// ─── User Queries ─────────────────────────────────────────────────────────────

/**
 * Find a user by email.
 * Returns null if not found (never throws — let the Service decide what to do).
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Find a user by their primary key.
 */
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

/**
 * Find a user by ID including their roles, assigned schools, and permissions.
 */
export async function findUserWithRoles(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
      roles: {
        select: {
          id: true,
          schoolId: true,
          school: {
            select: {
              id: true,
              name: true,
            },
          },
          role: {
            select: {
              id: true,
              name: true,
              permissions: {
                select: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Create a new user.
 * Accepts only the fields needed at registration time.
 * The passwordHash is pre-computed by the Service (hashing is business logic).
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
}): Promise<User> {
  return prisma.user.create({ data });
}

// ─── Refresh Token Queries ────────────────────────────────────────────────────

/**
 * Persist a new refresh token for a user.
 * We store refresh tokens in the DB so we can:
 *  - Revoke individual sessions (logout)
 *  - Detect token reuse (rotation security)
 */
export async function createRefreshToken(data: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  return prisma.refreshToken.create({ data });
}

/**
 * Find a refresh token record by the raw token string.
 * Returns null if not found or already deleted.
 */
export async function findRefreshToken(
  token: string
): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({
    where: { token },
  });
}

/**
 * Delete a single refresh token (logout from one device).
 */
export async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.delete({ where: { token } });
}

/**
 * Delete ALL refresh tokens for a user (logout from all devices).
 */
export async function deleteAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}

/**
 * Token rotation: atomically delete the old token and create the new one.
 * Using a $transaction ensures we never end up with 0 or 2 valid tokens.
 *
 * WHY $transaction?
 * If we delete then crash before creating, the user is permanently logged out.
 * A transaction is all-or-nothing — both operations succeed or both roll back.
 */
export async function rotateRefreshToken(
  oldToken: string,
  newTokenData: { userId: string; token: string; expiresAt: Date }
): Promise<RefreshToken> {
  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.delete({ where: { token: oldToken } });
    return tx.refreshToken.create({ data: newTokenData });
  });
}
