// Permission system for role-based access control
export type Permission =
  // Student management
  | "students.view"
  | "students.create"
  | "students.edit"
  | "students.delete"
  | "students.enrollment"
  | "students.attendance"

  // Teacher management
  | "teachers.view"
  | "teachers.create"
  | "teachers.edit"
  | "teachers.delete"
  | "teachers.assign"

  // Course management
  | "courses.view"
  | "courses.create"
  | "courses.edit"
  | "courses.delete"
  | "courses.assign"

  // Schedule management
  | "schedule.view"
  | "schedule.create"
  | "schedule.edit"
  | "schedule.delete"

  // Financial management
  | "finance.view"
  | "finance.create"
  | "finance.edit"
  | "finance.delete"
  | "finance.reports"

  // Reports and analytics
  | "reports.view"
  | "reports.export"
  | "reports.advanced"

  // System settings
  | "settings.view"
  | "settings.edit"
  | "settings.system"

  // User management
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  center_owner: [
    // Full access to everything
    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "students.enrollment",
    "students.attendance",
    "teachers.view",
    "teachers.create",
    "teachers.edit",
    "teachers.delete",
    "teachers.assign",
    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.assign",
    "schedule.view",
    "schedule.create",
    "schedule.edit",
    "schedule.delete",
    "finance.view",
    "finance.create",
    "finance.edit",
    "finance.delete",
    "finance.reports",
    "reports.view",
    "reports.export",
    "reports.advanced",
    "settings.view",
    "settings.edit",
    "settings.system",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
  ],
  teacher: [
    // Limited access for teachers
    "students.view",
    "students.attendance",
    "courses.view",
    "schedule.view",
    "reports.view",
    "settings.view",
  ],
  admin: [
    // System admin access
    "students.view",
    "students.create",
    "students.edit",
    "students.delete",
    "students.enrollment",
    "students.attendance",
    "teachers.view",
    "teachers.create",
    "teachers.edit",
    "teachers.delete",
    "teachers.assign",
    "courses.view",
    "courses.create",
    "courses.edit",
    "courses.delete",
    "courses.assign",
    "schedule.view",
    "schedule.create",
    "schedule.edit",
    "schedule.delete",
    "finance.view",
    "finance.reports",
    "reports.view",
    "reports.export",
    "reports.advanced",
    "settings.view",
    "settings.edit",
    "settings.system",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
  ],
}

export function hasPermission(userRole: string, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || []
  return rolePermissions.includes(permission)
}

export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission))
}

export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission))
}
