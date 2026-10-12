/**
 * School Repository
 *
 * WHY THIS FILE EXISTS:
 * Same pattern as auth.repositories.ts — Prisma lives ONLY here.
 * The School service calls these clean functions without knowing
 * anything about the query language or database driver.
 */

import { prisma } from "../../../lib/prisma.js";
import type { School, Role, UserRole } from "../../../generated/prisma/client.js";
import { DEFAULT_ROLES } from "../../../config/roles.config.js";

// ─── School Queries ───────────────────────────────────────────────────────────

export async function createSchool(data: { name: string }): Promise<School> {
  return prisma.school.create({ data });
}

export async function findSchoolById(id: string): Promise<School | null> {
  return prisma.school.findUnique({ where: { id } });
}

/**
 * List all schools a specific user belongs to.
 * Useful for the "Switch School" dropdown on the frontend.
 */
export async function findSchoolsByUserId(userId: string): Promise<School[]> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { school: true },
  });

  // A user can have multiple roles at the same school.
  // We deduplicate by using a Map keyed on school id.
  const schoolMap = new Map<string, School>();
  for (const ur of userRoles) {
    if (ur.school) {
      schoolMap.set(ur.school.id, ur.school);
    }
  }
  return Array.from(schoolMap.values());
}

// ─── Role & UserRole Queries (School-Context) ────────────────────────────────

/**
 * Create or find a role within a school.
 * Uses upsert so seeding and runtime creation are both safe.
 */
export async function upsertRole(data: {
  schoolId: string;
  name: string;
}): Promise<Role> {
  return prisma.role.upsert({
    where: { schoolId_name: { schoolId: data.schoolId, name: data.name } },
    update: {},
    create: { schoolId: data.schoolId, name: data.name },
  });
}

/**
 * Assign a user to a role within a specific school.
 * Uses upsert to prevent duplicate assignments.
 */
export async function assignUserRole(data: {
  userId: string;
  roleId: string;
  schoolId: string;
}): Promise<UserRole> {
  return prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: data.userId, roleId: data.roleId },
    },
    update: {},
    create: data,
  });
}

/**
 * Run a full "create school + seed roles & permissions + assign to creator"
 * atomically in a single transaction.
 *
 * WHY $transaction?
 * If the school is created but the role seeding crashes, we'd have an
 * orphan school with broken permissions. A transaction guarantees
 * all-or-nothing.
 */
export async function createSchoolWithAdmin(data: {
  name: string;
  creatorUserId: string;
}): Promise<{ school: School; role: Role; userRole: UserRole }> {
  return prisma.$transaction(async (tx) => {
    // 1. Create the school
    const school = await tx.school.create({
      data: { name: data.name },
    });

    // 2. Seed the default roles and their permissions
    const createdRoles = new Map<string, Role>();

    for (const [roleName, permissions] of Object.entries(DEFAULT_ROLES)) {
      const role = await tx.role.create({
        data: {
          schoolId: school.id,
          name: roleName,
          // Prisma Nested Create: Inserts the role AND its permissions together
          permissions: {
            create: permissions.map((p) => ({ permission: p })),
          },
        },
      });
      createdRoles.set(roleName, role);
    }

    const adminRole = createdRoles.get("SCHOOL_ADMIN");
    if (!adminRole) {
      throw new Error("Critical: SCHOOL_ADMIN role blueprint is missing");
    }

    // 3. Assign the creator as SCHOOL_ADMIN
    const userRole = await tx.userRole.create({
      data: {
        userId: data.creatorUserId,
        roleId: adminRole.id,
        schoolId: school.id,
      },
    });

    return { school, role: adminRole, userRole };
  });
}

