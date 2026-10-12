import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { PermissionString } from "../../config/permissions.config.js";

/**
 * Authorization Middleware — Tenant-Aware RBAC (Are you allowed to do this HERE?)
 *
 * This middleware MUST run AFTER both `requireAuth` and `requireSchool`.
 * It checks permissions in the context of a specific school, not globally.
 *
 * WHY THIS MATTERS:
 * A user might be ADMIN at School A and PARENT at School B.
 * Without scoping by schoolId, the PARENT at School B would inherit
 * ADMIN powers from School A — a critical security flaw.
 *
 * The query filters UserRole by BOTH userId AND schoolId, ensuring
 * complete tenant isolation.
 */
export const authorize = (required: PermissionString) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("UNAUTHENTICATED", "Not authenticated", 401);
      }

      const schoolId = req.schoolId;
      if (!schoolId) {
        throw new AppError(
          "BAD_REQUEST",
          "School context is required for authorization. Ensure requireSchool middleware runs first.",
          400
        );
      }

      // Fetch roles for this user AT THIS SPECIFIC SCHOOL only
      const userRoles = await prisma.userRole.findMany({
        where: { userId, schoolId },
        include: { role: { include: { permissions: true } } },
      });

      const hasPermission = userRoles.some((ur) =>
        ur.role.permissions.some((p) => p.permission === required)
      );

      if (!hasPermission) {
        throw new AppError("FORBIDDEN", `Missing permission: ${required}`, 403);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};