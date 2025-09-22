"use client"
import { Button, type ButtonProps } from "@/components/ui/button"
import { usePermissions } from "../../../../hooks/use-permission"
import type { Permission } from "../../../../lib/permission"
import { cn } from "../../../../lib/class"

interface ProtectedButtonProps extends ButtonProps {
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  hideWhenNoAccess?: boolean
}

export function ProtectedButton({
  children,
  permission,
  permissions = [],
  requireAll = false,
  hideWhenNoAccess = false,
  className,
  ...props
}: ProtectedButtonProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions)
  } else {
    hasAccess = true
  }

  if (!hasAccess && hideWhenNoAccess) {
    return null
  }

  return (
    <Button
      {...props}
      disabled={!hasAccess || props.disabled}
      className={cn(!hasAccess && "opacity-50 cursor-not-allowed", className)}
    >
      {children}
    </Button>
  )
}
