// src/seeding/rbac.seed.ts
import { prisma } from "../lib/prisma.js";
import { PERMISSION_CATALOG } from "../config/permissions.config.js";

// Define what each role can do, in terms of your catalog
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SCHOOL_ADMIN: [
    "user.create", "user.read", "user.list", "user.update", "user.delete",
    "student.create", "student.read", "student.list", "student.update",
    "teacher.create", "teacher.read", "teacher.list", "teacher.update",
  ],
  TEACHER: [
    "student.read", "student.list",
    "attendance.create", "attendance.read", "attendance.list",
  ],
  PARENT: ["student.read", "attendance.read"],
  STUDENT: ["attendance.read"],
};

export async function seedRolesForSchool(schoolId: string) {
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { schoolId_name: { schoolId, name: roleName } },
      update: {},
      create: { schoolId, name: roleName },
    });

    for (const permission of permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permission: { roleId: role.id, permission } },
        update: {},
        create: { roleId: role.id, permission },
      });
    }
  }
  console.log(`Seeded roles for school ${schoolId}`);
}

export async function seedSuperAdmin() {
  await prisma.role.upsert({
    where: { schoolId_name: { schoolId: null as any, name: "SUPER_ADMIN" } },
    update: {},
    create: { schoolId: null, name: "SUPER_ADMIN" },
  });
}