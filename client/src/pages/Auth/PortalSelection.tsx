import type React from "react"
import { useNavigate } from "react-router-dom"
import { GraduationCap, Users, Shield, Building2 } from "lucide-react"

export function PortalSelection() {
  const navigate = useNavigate()

  const portals = [
    {
      id: "management",
      title: "Cổng Quản Lý",
      description: "Dành cho Chủ trung tâm & Giáo viên",
      icon: Building2,
      gradient: "from-indigo-500 to-purple-600",
      path: "/auth/login/management",
      bgGradient: "from-indigo-400/30 to-purple-400/30",
    },
    {
      id: "family",
      title: "Cổng Gia Đình",
      description: "Dành cho Phụ huynh & Học sinh",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      path: "/auth/login/family",
      bgGradient: "from-blue-400/30 to-cyan-400/30",
    },
    {
      id: "admin",
      title: "Cổng Quản Trị",
      description: "Dành cho Quản trị viên IT",
      icon: Shield,
      gradient: "from-red-500 to-orange-600",
      path: "/auth/login/admin",
      bgGradient: "from-red-400/30 to-orange-400/30",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzYuNjI3IDAgMTIgNS4zNzMgMTIgMTJzLTUuMzczIDEyLTEyIDEyLTEyLTUuMzczLTEyLTEyIDUuMzczLTEyIDEyLTEyem0wIDJ2MjBjNS41MjMgMCAxMC00LjQ3NyAxMC0xMFMzNi41MjMgMTYgMzYgMTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl mb-6 transform transition-transform hover:rotate-12 duration-300">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
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
            const Icon = portal.icon
            return (
              <div
                key={portal.id}
                onClick={() => navigate(portal.path)}
                className="group cursor-pointer transform transition-all duration-500 hover:scale-105"
              >
                <div className="relative h-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8 overflow-hidden hover:shadow-2xl">
                  {/* Background Glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${portal.bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  {/* Icon */}
                  <div className="relative mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.gradient} shadow-lg transform transition-transform group-hover:scale-110 group-hover:rotate-6 duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${portal.gradient} bg-clip-text text-transparent mb-3`}>
                      {portal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Arrow Icon */}
                  <div className="mt-6 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
            <a href="mailto:support@qnedu.vn" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
             hainvthe172670@fpt.edu.vn
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

