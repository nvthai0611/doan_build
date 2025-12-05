import type React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { LoginForm } from "./Login"
import { ParentStudentLogin } from "./ParentStudentLogin"
import { AdminLogin } from "./AdminLogin"

export function PortalSelection() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedPortal = searchParams.get("portal")

  if (selectedPortal === "management") {
    return <LoginForm />
  }

  if (selectedPortal === "family") {
    return <ParentStudentLogin />
  }

  if (selectedPortal === "admin") {
    return <AdminLogin />
  }

  const portals = [
    {
      id: "management",
      title: "Cổng Quản Lý",
      description: "Dành cho Chủ trung tâm & Giáo viên",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-400/30 to-blue-500/30",
    },
    {
      id: "family",
      title: "Cổng Gia Đình",
      description: "Dành cho Phụ huynh & Học sinh",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-400/30 to-blue-500/30",
    },
    {
      id: "admin",
      title: "Cổng Quản Trị",
      description: "Dành cho Quản trị viên IT",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-400/30 to-blue-500/30",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-sky-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDJ2MjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMzNi41MjMgMTYgMzYgMTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-sky-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/30 dark:border-slate-700/60 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-slate-900/90 transition-all shadow-md"
      >
        <span className="text-sm font-medium">Về trang chủ</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-3">
            QN-EDU
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Hệ thống quản lý trung tâm giáo dục
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Vui lòng chọn cổng đăng nhập phù hợp
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portals.map((portal) => {
            return (
              <div
                key={portal.id}
                onClick={() => navigate(`/auth?portal=${portal.id}`, { replace: false })}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              >
                <div className="relative h-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 overflow-hidden hover:shadow-2xl">
                  {/* Background Glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${portal.bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${portal.gradient} bg-clip-text text-transparent mb-3`}>
                      {portal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Link */}
                  <div className="mt-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Đăng nhập
                    <svg
                      className="ml-2 w-4 h-4 transform transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © 2025 QNEdu. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Cần hỗ trợ? Liên hệ:{" "}
            <a href="mailto:support@qnedu.vn" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
             hainvthe172670@fpt.edu.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

