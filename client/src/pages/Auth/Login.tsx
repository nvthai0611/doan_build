import type React from "react"

import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { login, logout, loading } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Login và validate role TRƯỚC KHI lưu tokens
      const result = await login(identifier, password)
      
      // Validate role - chỉ cho phép Center Owner và Teacher
      const allowedRoles = ['center_owner', 'teacher']
      if (!allowedRoles.includes(result?.user?.role)) {
        const roleNames: any = {
          parent: 'Phụ huynh',
          student: 'Học sinh', 
          admin: 'Quản trị viên'
        }
        
        // CHẶN NGAY - Logout ngay lập tức không cho vào hệ thống
        await logout()
        setError(`Tài khoản ${roleNames[result?.user?.role] || result?.user?.role} không có quyền truy cập Cổng Quản Lý. Vui lòng sử dụng cổng phù hợp.`)
        return
      }
      
      // Role hợp lệ → Redirect đến trang quản trị tương ứng
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      } else {
        // Default redirect: Center Owner về /center-qn, Teacher về /teacher/overview
        const defaultPath = result.user.role === 'center_owner' ? '/center-qn' : '/teacher/overview'
        navigate(defaultPath, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || "Email/Tên đăng nhập hoặc mật khẩu không đúng")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      {/* Back Button */}
      <button
        onClick={() => navigate("/auth")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 shadow-sm"
      >
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow border border-gray-200 dark:border-slate-700 p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              Cổng Quản Lý
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dành cho Chủ trung tâm & Giáo viên
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email hoặc Tên đăng nhập
              </Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Email hoặc tên đăng nhập"
                value={identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                required
                className="h-12 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu
                </Label>
                <button
                  type="button"
                  onClick={() => navigate("/auth/forgot-password")}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="pr-20 h-12 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 dark:text-blue-300 text-sm"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="rounded-lg border-red-200 dark:border-red-800">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>

          {/* Demo Accounts - Only show in development */}
          {import.meta.env.VITE_PROD === 'development' && (
            <div className="mt-8 p-5 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-gray-200/50 dark:border-slate-600/50">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Tài khoản demo
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("owner"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">👑 Chủ trung tâm</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">owner</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("teacher"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">👨‍🏫 Giáo viên</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">teacher</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("student"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">👨‍🎓 Học sinh</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">student</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("parent"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">👨‍👩‍👧 Phụ huynh</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">parent</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("admin"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">⚙️ Quản trị viên</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">admin</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          © 2025 QNEdu. All rights reserved.
        </p>
      </div>
    </div>
  )
}
