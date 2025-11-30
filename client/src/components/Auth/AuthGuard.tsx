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
  fallback = <Navigate to="/auth" state={{ from: useLocation() }} replace />
}: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-blue-600">Đang tải...</p>
        </div>
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
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">Không có quyền truy cập</h1>
            <p className="text-gray-700">Bạn không có quyền truy cập trang này.</p>
            {/* <p className="text-sm text-gray-600 mt-2">
              Role hiện tại: {user.role} | Role yêu cầu: {allowedRoles.join(', ')}
            </p> */}
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
