"use client"

import { useState } from "react"
import { useAuth } from "../../../lib/auth"
import { cn } from "../../../lib/class"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BarChart3,
  Users,
  GraduationCap,
  Calendar,
  Settings,
  BookOpen,
  DollarSign,
  UserCheck,
  Building,
  LogOut,
  ChevronDown,
  Home,
  UserCog,
  MessageSquare,
  Upload,
  Target,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const centerOwnerMenuItems = [
  {
    title: "Tổng quan",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "Quản lý học sinh",
    icon: Users,
    href: "/students",
    children: [
      { title: "Danh sách học sinh", href: "/students" },
      { title: "Thông tin phụ huynh", href: "/students/parents" },
      { title: "Phân lớp tự động", href: "/students/auto-assign" },
      { title: "Học bạ nội bộ", href: "/students/records" },
      { title: "Kết quả học tập", href: "/students/results" },
      { title: "Chuyên cần", href: "/students/attendance" },
    ],
  },
  {
    title: "Quản lý giáo viên",
    icon: GraduationCap,
    href: "/teachers",
    children: [
      { title: "Danh sách giáo viên", href: "/teachers" },
      { title: "Thông tin chuyên môn", href: "/teachers/expertise" },
      { title: "Lịch dạy", href: "/teachers/schedule" },
      { title: "Hợp đồng & Nhân sự", href: "/teachers/contracts" },
      { title: "Quản lý lương", href: "/teachers/salary" },
      { title: "Đánh giá từ PH/HS", href: "/teachers/reviews" },
      { title: "Đổi lịch dạy", href: "/teachers/schedule-changes" },
    ],
  },
  {
    title: "Lớp học & Khóa học",
    icon: BookOpen,
    href: "/courses",
    children: [
      { title: "Tạo khóa học mới", href: "/courses/create" },
      { title: "Quản lý khóa học", href: "/courses" },
      { title: "Thời khóa biểu", href: "/courses/timetable" },
      { title: "Quản lý phòng học", href: "/courses/rooms" },
      { title: "Cảnh báo xung đột", href: "/courses/conflicts" },
      { title: "Clone khóa học", href: "/courses/clone" },
    ],
  },
  {
    title: "Tài chính",
    icon: DollarSign,
    href: "/finance",
    children: [
      { title: "Định nghĩa học phí", href: "/finance/tuition" },
      { title: "Phiếu thu - chi", href: "/finance/receipts" },
      { title: "Thanh toán online", href: "/finance/online-payment" },
      { title: "Báo cáo thu chi", href: "/finance/reports" },
      { title: "Nợ học phí", href: "/finance/debts" },
      { title: "Học bổng & Giảm phí", href: "/finance/scholarships" },
    ],
  },
  {
    title: "Báo cáo - Thống kê",
    icon: BarChart3,
    href: "/reports",
    children: [
      { title: "Dashboard trực quan", href: "/reports/dashboard" },
      { title: "Báo cáo sĩ số", href: "/reports/enrollment" },
      { title: "Báo cáo chuyên cần", href: "/reports/attendance" },
      { title: "Báo cáo học phí", href: "/reports/tuition" },
      { title: "Báo cáo doanh thu", href: "/reports/revenue" },
      { title: "Thống kê kết quả", href: "/reports/results" },
      { title: "Xuất PDF/Excel", href: "/reports/export" },
    ],
  },
  {
    title: "Truyền thông",
    icon: MessageSquare,
    href: "/communication",
    children: [
      { title: "Thông báo chung", href: "/communication/announcements" },
      { title: "Quản lý sự kiện", href: "/communication/events" },
      { title: "Họp phụ huynh", href: "/communication/parent-meetings" },
      { title: "Hoạt động ngoại khóa", href: "/communication/activities" },
      { title: "Thông báo tự động", href: "/communication/auto-notifications" },
    ],
  },
  {
    title: "Quản lý người dùng",
    icon: UserCog,
    href: "/users",
  },
  {
    title: "Cài đặt",
    icon: Settings,
    href: "/settings",
  },
]

const teacherMenuItems = [
  {
    title: "Tổng quan",
    icon: Home,
    href: "/teacher/dashboard",
  },
  {
    title: "Quản lý lớp học",
    icon: Users,
    href: "/teacher/classes",
    children: [
      { title: "Lớp được phân công", href: "/teacher/classes" },
      { title: "Thống kê tiến độ", href: "/teacher/classes/progress" },
    ],
  },
  {
    title: "Điểm danh",
    icon: UserCheck,
    href: "/teacher/attendance",
  },
  {
    title: "Quản lý điểm",
    icon: Target,
    href: "/teacher/grades",
    children: [
      { title: "Nhập điểm kiểm tra", href: "/teacher/grades/input" },
      { title: "Đánh giá học sinh", href: "/teacher/grades/evaluation" },
      { title: "Nhận xét định kỳ", href: "/teacher/grades/comments" },
    ],
  },
  {
    title: "Tài liệu",
    icon: Upload,
    href: "/teacher/documents",
    children: [
      { title: "Upload tài liệu", href: "/teacher/documents/upload" },
      { title: "Quản lý files", href: "/teacher/documents/manage" },
    ],
  },
  {
    title: "Lịch dạy cá nhân",
    icon: Calendar,
    href: "/teacher/schedule",
    children: [
      { title: "Xem lịch dạy", href: "/teacher/schedule" },
      { title: "Đổi ca dạy", href: "/teacher/schedule/change" },
      { title: "Đơn xin nghỉ", href: "/teacher/schedule/leave" },
    ],
  },
  {
    title: "Thông tin cá nhân",
    icon: Settings,
    href: "/teacher/profile",
  },
]

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const menuItems = user?.role === "center_owner" ? centerOwnerMenuItems : teacherMenuItems

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
  }

  return (
    <div className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">CenterUp</h2>
            <p className="text-xs text-muted-foreground">
              {user?.role === "center_owner" ? "Quản lý trung tâm" : "Giáo viên"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {menuItems.map((item) => (
            <div key={item.title}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-3 h-10", item.children && "pr-2")}
                onClick={() => item.children && toggleExpanded(item.title)}
              >
                <item.icon className="w-4 h-4" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.children && (
                  <ChevronDown
                    className={cn("w-4 h-4 transition-transform", expandedItems.includes(item.title) && "rotate-180")}
                  />
                )}
              </Button>

              {item.children && expandedItems.includes(item.title) && (
                <div className="ml-7 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Button
                      key={child.title}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-muted-foreground hover:text-foreground"
                    >
                      {child.title}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
