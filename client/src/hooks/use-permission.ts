"use client"

import { useAuth } from "../lib/auth"
import { hasPermission, hasAnyPermission, hasAllPermissions, type Permission } from "../lib/permission"

export function usePermissions() {
  const { user } = useAuth()

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false
    
    // If user has permissions from API, use them
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions.includes(permission)
    }
    
    // Fallback to role-based permission check
    return hasPermission(user.role, permission)
  }

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false
    
    // If user has permissions from API, use them
    if (user.permissions && user.permissions.length > 0) {
      return permissions.some(permission => user.permissions!.includes(permission))
    }
    
    // Fallback to role-based permission check
    return hasAnyPermission(user.role, permissions)
  }

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false
    
    // If user has permissions from API, use them
    if (user.permissions && user.permissions.length > 0) {
      return permissions.every(permission => user.permissions!.includes(permission))
    }
    
    // Fallback to role-based permission check
    return hasAllPermissions(user.role, permissions)
  }

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    userRole: user?.role,
    userPermissions: user?.permissions || [],
  }
}
