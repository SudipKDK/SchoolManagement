import { PERMISSION_CATALOG, type PermissionString } from "./permissions.config.js";

/**
 * Automatically generates an array of ALL possible permissions from the catalog.
 * This is useful for assigning the SCHOOL_ADMIN role.
 */
function getAllPermissions(): PermissionString[] {
  const all: PermissionString[] = [];
  for (const [resource, actions] of Object.entries(PERMISSION_CATALOG)) {
    for (const action of actions) {
      all.push(`${resource}.${action}` as PermissionString);
    }
  }
  return all;
}

/**
 * The default blueprint of roles and their permissions.
 * Whenever a new school is created, these roles are automatically
 * seeded into the tenant's database partition.
 */
export const DEFAULT_ROLES: Record<string, PermissionString[]> = {
  // Admins get complete control over everything
  SCHOOL_ADMIN: getAllPermissions(),

  // Teachers can manage students, attendance, grades, view academic structures and schedules
  TEACHER: [
    "student.read",
    "student.list",
    "classroom.read",
    "classroom.list",
    "subject.read",
    "subject.list",
    "academicYear.read",
    "academicYear.list",
    "timetable.read",
    "timetable.list",
    "attendance.read",
    "attendance.list",
    "attendance.create",
    "attendance.update",
    "grade.read",
    "grade.list",
    "grade.create",
    "grade.update",
    "announcement.read",
    "announcement.list",
  ],

  // Students can only read data related to themselves
  STUDENT: [
    "classroom.read",
    "subject.read",
    "academicYear.read",
    "timetable.read",
    "attendance.read",
    "grade.read",
    "announcement.read",
    "announcement.list",
  ],

  // Guardians can view their dependents' data
  GUARDIAN: [
    "student.read",
    "classroom.read",
    "subject.read",
    "academicYear.read",
    "timetable.read",
    "attendance.read",
    "grade.read",
    "fee.read",
    "announcement.read",
    "announcement.list",
  ],
};
