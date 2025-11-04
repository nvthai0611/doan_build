import React from 'react'
import { useAuth } from '../../lib/auth'

interface RoleGateProps {
  roles: string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ 
  roles, 
  children, 
  fallback = null 
}: RoleGateProps) {
  const { user } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  const hasAccess = roles.includes(user.role)

  return hasAccess ? <>{children}</> : <>{fallback}</>
}
