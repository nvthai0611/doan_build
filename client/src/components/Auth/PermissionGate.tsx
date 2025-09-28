import React from 'react'
import { useAuth } from '../../lib/auth'
import { hasPermission } from '../../lib/permission'

interface PermissionGateProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  const hasAccess = hasPermission(user.role, permission as any)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
