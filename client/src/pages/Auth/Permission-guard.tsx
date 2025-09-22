"use client"

import type React from "react"
import { usePermissions } from "../../hooks/use-permission"
import type { Permission } from "../../lib/permission"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"

interface PermissionGuardProps {
  children: React.ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
  } else {
    hasAccess = true // No permissions specified, allow access
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return null
  }

  return <>{children}</>
}
// (
//     <Alert variant="destructive" className="m-4">
//       <ShieldX className="h-4 w-4" />
//       {/* <AlertDescription>Bạn không có quyền truy cập vào tính năng này.</AlertDescription> */}
//     </Alert>
//   )