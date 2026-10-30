export const PERMISSION_CATALOG = {
  user: ["read", "list", "create", "update", "delete"],
  student: ["read", "list", "create", "update", "delete"],
  teacher: ["read", "list", "create", "update", "delete"],
  guardian: ["read", "list", "create", "update", "delete"],
  attendance: ["read", "list", "create", "update"],
  grade: ["read", "list", "create", "update"],
  fee: ["read", "list", "create", "update"],
  announcement: ["read", "list", "create", "update", "delete"],
  classroom: ["read", "list", "create", "update", "delete"],
  subject: ["read", "list", "create", "update", "delete"],
  academicYear: ["read", "list", "create", "update", "delete"],
  timetable: ["read", "list", "create", "update", "delete"],
} as const satisfies Record<string, readonly string[]>;

// derive a flat union type for type-safe permission strings
type PermissionResource = keyof typeof PERMISSION_CATALOG;
export type PermissionString = {
  [K in PermissionResource]: `${K}.${typeof PERMISSION_CATALOG[K][number]}`;
}[PermissionResource];