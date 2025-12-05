import { useState } from "react"
import { Home, Users, Calendar, CircleDollarSign, BookOpen, Target } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

type MobileNavItem = {
  title: string
  href: string
  icon: any
  children?: { title: string; href: string }[]
}

const parentNav: MobileNavItem[] = [
  { title: "Tổng quan", href: "/parent/dashboard", icon: Home },
  { title: "Các con", href: "/parent/children", icon: Users },
  { title: "Lịch", href: "/parent/schedule", icon: Calendar },
  { title: "Học phí", href: "/parent/financial", icon: CircleDollarSign },
  {
    title: "Khác",
    href: "/parent/more",
    icon: Target,
    children: [
      { title: "Lớp học", href: "/parent/classes" },
      { title: "Đăng ký khoá", href: "/parent/recruiting-classes" },
      { title: "Đơn nghỉ học", href: "/parent/student-leave-requests" },
      { title: "Cam kết học tập", href: "/parent/commitments" },
    ],
  },
]

const studentNav: MobileNavItem[] = [
  { title: "Trang chủ", href: "/student", icon: Home },
  { title: "Lớp học", href: "/student/my-classes", icon: BookOpen },
  { title: "Lịch", href: "/student/my-schedule", icon: Calendar },
  { title: "Điểm", href: "/student/my-grades", icon: Target },
]

const teacherNav: MobileNavItem[] = [
  { title: "Tổng quan", href: "/teacher/overview", icon: Home },
  { title: "Lớp dạy", href: "/teacher/classes", icon: BookOpen },
  { title: "Lịch dạy", href: "/teacher/schedule", icon: Calendar },
  { 
    title: "Điểm số", 
    href: "/teacher/grades", 
    icon: Target,
    children: [
      { title: "Nhập điểm", href: "/teacher/grades/input" },
      { title: "Xem điểm", href: "/teacher/grades/view" },
      { title: "Đánh giá", href: "/teacher/grades/evaluation" },
    ],
  },
  {
    title: "Khác",
    href: "/teacher/more",
    icon: CircleDollarSign,
    children: [
      { title: "Tài liệu", href: "/teacher/documents" },
      { title: "Yêu cầu", href: "/teacher/requests" },
      { title: "Đơn xin nghỉ", href: "/teacher/requests/leave" },
      { title: "Đơn của tôi", href: "/teacher/requests/my-requests" },
      { title: "Đơn nghỉ học sinh", href: "/teacher/requests/student-leave-requests" },
      { title: "Sự cố", href: "/teacher/incidents" },
      { title: "Bảng lương", href: "/teacher/payroll-management" },
      { title: "Hợp đồng", href: "/teacher/contracts" },
    ],
  },
]

export function MobileBottomNav() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [openItem, setOpenItem] = useState<MobileNavItem | null>(null)

  const navItems =
    user?.role === "parent"
      ? parentNav
      : user?.role === "student"
      ? studentNav
      : user?.role === "teacher"
      ? teacherNav
      : null
  if (!navItems) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 block md:hidden border-t border-border bg-white/95 backdrop-blur">
      <div className="grid grid-flow-col auto-cols-fr text-[11px]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => {
                if (item.children && item.children.length > 0) {
                  setOpenItem(item)
                  return
                }
                navigate(item.href)
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="leading-tight text-[10px] sm:text-[11px]">{item.title}</span>
            </button>
          )
        })}
      </div>

      <Sheet open={!!openItem} onOpenChange={(open: boolean) => !open && setOpenItem(null)}>
        <SheetContent side="bottom" className="max-h-[50vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{openItem?.title}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid gap-2">
            {openItem?.children?.map((child) => (
              <Button
                key={child.href}
                variant="outline"
                className="justify-between"
                onClick={() => {
                  navigate(child.href)
                  setOpenItem(null)
                }}
              >
                <span>{child.title}</span>
                <span className="text-xs text-muted-foreground">{child.href}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}

