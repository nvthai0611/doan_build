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
    },
    {
      id: "family",
      title: "Cổng Gia Đình",
      description: "Dành cho Phụ huynh & Học sinh",
    },
    {
      id: "admin",
      title: "Cổng Quản Trị",
      description: "Dành cho Quản trị viên IT",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 shadow-sm"
      >
        <span className="text-sm font-medium">Về trang chủ</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-3">
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
                className="cursor-pointer"
              >
                <div className="relative h-full bg-white dark:bg-slate-800 rounded-2xl shadow border border-gray-200 dark:border-slate-700 p-8">
                  <div className="relative">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                      {portal.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {portal.description}
                    </p>
                  </div>

                  {/* Link */}
                  <div className="mt-6 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                    Đăng nhập
                    <svg
                      className="ml-2 w-4 h-4"
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

