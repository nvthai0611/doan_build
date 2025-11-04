import React from 'react'
import { useAuth } from '../../lib/auth'
import { Navigate, useLocation } from 'react-router-dom'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  allowedRoles?: string[]
  fallback?: React.ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [],
  fallback = <Navigate to="/auth/login" state={{ from: useLocation() }} replace />
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Nếu không yêu cầu auth và user đã đăng nhập, redirect về home
  if (!requireAuth && user) {
    return <Navigate to="/" replace />
  }

  // Nếu yêu cầu auth nhưng chưa đăng nhập
  if (requireAuth && !user) {
    return fallback
  }

  // Nếu có user và có yêu cầu role cụ thể
  if (user && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.includes(user.role)
    
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
            <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
            <p className="text-sm text-gray-500 mt-2">
              Role hiện tại: {user.role} | Role yêu cầu: {allowedRoles.join(', ')}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
