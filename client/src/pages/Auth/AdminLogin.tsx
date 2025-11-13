import type React from "react"
import { useState } from "react"
import { useAuth } from "../../lib/auth"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"

export function AdminLogin() {
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
      
      // Validate role - chỉ cho phép Admin
      const allowedRoles = ['admin']
      if (!allowedRoles.includes(result?.user?.role)) {
        const roleNames: any = {
          center_owner: 'Chủ trung tâm',
          teacher: 'Giáo viên',
          parent: 'Phụ huynh',
          student: 'Học sinh'
        }
        
        // CHẶN NGAY - Logout ngay lập tức không cho vào hệ thống
        await logout()
        setError(`🚫 Tài khoản ${roleNames[result?.user?.role] || result?.user?.role} không có quyền truy cập Cổng Quản Trị. Chỉ dành cho Quản trị viên IT.`)
        return
      }
      
      // Role hợp lệ → Redirect đến trang admin
      const redirectPath = sessionStorage.getItem('redirectAfterLogin')
      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin')
        navigate(redirectPath, { replace: true })
      } else {
        navigate('/admin', { replace: true })
      }
    } catch (err: any) {
      setError(err.message || "Email/Tên đăng nhập hoặc mật khẩu không đúng")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Gradient Background - Red/Orange Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-slate-900 dark:via-red-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDJ2MjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMzNi41MjMgMTYgMzYgMTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs - Red/Orange */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-red-400/30 to-orange-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-amber-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/auth")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-slate-900/90 transition-all shadow-lg"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Glass Morphism Card */}
        <div className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 shadow-lg mb-4 transform transition-transform hover:rotate-12 duration-300">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Cổng Quản Trị
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dành cho Quản trị viên IT
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-red-700 dark:text-red-400">Restricted Access</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email/Username Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email hoặc Tên đăng nhập
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Email hoặc tên đăng nhập"
                  value={identifier}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
                  required
                  className="pl-10 h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mật khẩu
                </Label>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12 bg-white/50 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 rounded-xl transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-200 dark:border-red-800 animate-in slide-in-from-top-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {/* Demo Account - Only show in development */}
          {import.meta.env.VITE_PROD === 'development' && (
            <div className="mt-8 p-5 bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-gray-200/50 dark:border-slate-600/50">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Tài khoản demo
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors cursor-pointer" onClick={() => { setIdentifier("admin"); setPassword("123456") }}>
                  <span className="font-medium text-gray-700 dark:text-gray-300">⚙️ Quản trị viên</span>
                  <span className="text-gray-500 dark:text-gray-400 text-[10px]">admin</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 text-center leading-relaxed">
              🔒 Cổng này chỉ dành cho quản trị viên IT. Mọi hoạt động đăng nhập đều được ghi nhận.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          © 2025 QNEdu. All rights reserved.
        </p>
      </div>
    </div>
  )
}

