"use client"

import { useAuth } from "../lib/auth"
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission } from "../lib/permission"

export function usePermissions() {
  const { user } = useAuth()

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    return hasPermission(user.role, permission)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    return hasAnyPermission(user.role, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    return hasAllPermissions(user.role, permissions)
  }

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userRole: user?.role,
  }
}
