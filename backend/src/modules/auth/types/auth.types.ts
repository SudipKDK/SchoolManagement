/**
 * Auth Domain — Shared Types
 *
 * WHY THIS FILE EXISTS:
 * The Service layer returns data that the Controller shapes into HTTP responses.
 * We define those return shapes here so:
 *  1. The Controller knows exactly what it receives from the Service (type-safe).
 *  2. We never accidentally leak sensitive fields (like passwordHash) to the client.
 *     The Repository returns a Prisma model; the Service strips it down to
 *     an AuthUser before passing it up.
 */

// ─── Safe User ────────────────────────────────────────────────────────────────
// A User object safe to include in API responses — no passwordHash.

export type AuthUser = {
  id: string;
  email: string;
  createdAt: Date;
};

// ─── Token Pair ───────────────────────────────────────────────────────────────
// What we return to the client on a successful login or register.

export type TokenPair = {
  accessToken: string;
  // refreshToken is set as an httpOnly cookie, NOT included in the JSON body.
  // We still pass it through the service → controller so the controller
  // can call res.cookie(...). It is never serialized to JSON directly.
  refreshToken: string;
};

// ─── Auth Result ──────────────────────────────────────────────────────────────
// The combined result of a login or register operation.

export type AuthResult = {
  user: AuthUser;
  tokens: TokenPair;
};

// ─── Current User Profile ─────────────────────────────────────────────────────

export type UserRoleDetail = {
  role: string;
  schoolId: string | null;
  schoolName: string | null;
  permissions: string[];
};

export type UserProfileResponse = {
  id: string;
  email: string;
  createdAt: Date;
  roles: UserRoleDetail[];
};

