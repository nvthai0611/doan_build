import { useState, useEffect } from "react"
import { useAuth } from "../../lib/auth"
import { cn } from "@/lib/utils"
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
    Menu,
    ChevronLeft,
    AlertTriangle,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
    className?: string
    onToggleCollapse?: (collapsed: boolean) => void
}

const centerOwnerMenuItems = [
    {
        title: "Tổng quan",
        icon: Home,
        href: "/center-qn",
    },
    {
        title: "Quản lý học sinh",
        icon: Users,
        href: "/center-qn/students",
        children: [
            { title: "Danh sách học sinh", href: "/center-qn/students" },
            { title: "Thông tin phụ huynh", href: "/center-qn/parents" },
            { title: "Phân lớp tự động", href: "/center-qn/students/auto-assign" },
            { title: "Học bạ nội bộ", href: "/center-qn/students/records" },
            { title: "Kết quả học tập", href: "/center-qn/students/results" },
            { title: "Chuyên cần", href: "/center-qn/students/attendance" },
        ],
    },
    {
        title: "Quản lý giáo viên",
        icon: GraduationCap,
        href: "/center-qn/teachers",
        children: [
            { title: "Danh sách giáo viên", href: "/center-qn/teachers" },
            { title: "Thông tin chuyên môn", href: "/center-qn/teachers/expertise" },
            { title: "Lịch dạy", href: "/center-qn/teachers/schedule" },
            { title: "Hợp đồng & Nhân sự", href: "/center-qn/teachers/contracts" },
            { title: "Quản lý lương", href: "/center-qn/teachers/salary" },
            { title: "Đánh giá từ PH/HS", href: "/center-qn/teachers/reviews" },
            { title: "Đổi lịch dạy", href: "/center-qn/teachers/schedule-changes" },
        ],
    },
    {
        title: "Lớp học & Khóa học",
        icon: BookOpen,
        href: "/center-qn/classes",
        children: [
            { title: "Quản lý lớp học", href: "/center-qn/classes" },
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
        title: "Báo cáo sự cố",
        icon: AlertTriangle,
        href: "/center-qn/incidents",

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
        href: "/teacher/profile",
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
    // {
    //     title: "Điểm danh",
    //     icon: UserCheck,
    //     href: "/teacher/attendance",
    // },
    {
        title: "Quản lý điểm",
        icon: Target,
        href: "/teacher/grades",
        children: [
            { title: "Nhập điểm kiểm tra", href: "/teacher/grades/input" },
            { title: "Xem điểm học sinh", href: "/teacher/grades/view" },
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
            // { title: "Đổi ca dạy", href: "/teacher/schedule/change" },
            { title: "Đơn xin nghỉ", href: "/teacher/schedule/leave" },
            { title: "Đơn của tôi", href: "/teacher/schedule/my-requests" },
        ],
    },
    {
        title: "Báo cáo sự cố",
        icon: AlertTriangle,
        href: "/teacher/incidents",
        children: [
            { title: "Báo cáo sự cố mới", href: "/teacher/incidents/report" },
            { title: "Quản lý báo cáo", href: "/teacher/incidents/manage" },
        ],
    },
    {
        title: "Thông tin cá nhân",
        icon: Settings,
        href: "/teacher/profile",
    },
]
const studentMenuItems = [
    {
        title: "Hồ Sơ",
        icon: UserCog,
        href: "/student/profile",
        children: undefined,
    },
    {
        title: "Lớp học của tôi",
        icon: Users,
        href: "/student/my-classes",
        children: undefined,
    },

    {
        title: "Bảng điểm",
        icon: Target,
        href: "/student/my-grades",
        children: undefined,
    },


    {
        title: "Lịch học",
        icon: Calendar,
        href: "/student/my-schedule",
        children: undefined,
    },
]

const parentMenuItems = [
    {
        title: "Tổng quan",
        icon: Home,
        href: "/parent/profile",
    },
    {
        title: "Đăng ký khoá học",
        icon: Target,
        href: "/parent/courses",
    },
    {
        title: "Các con của tôi",
        icon: Users,
        href: "/parent/children",
    },
    {
        title: "Tài liệu học tập",
        icon: Upload,
        href: "/parent/my-documents",
    },
]

export function SidebarCenterQn({ className, onToggleCollapse }: SidebarProps) {
    const { user, logout } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const menuItems = user?.role === "center_owner" ? centerOwnerMenuItems : user?.role === "teacher" ? teacherMenuItems : user?.role === "student" ? studentMenuItems : parentMenuItems
    const toggleExpanded = (title: string) => {
        setExpandedItems((prev) => (prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]))
    }

    const toggleCollapse = () => {
        const newCollapsedState = !isCollapsed
        setIsCollapsed(newCollapsedState)
        onToggleCollapse?.(newCollapsedState)
        if (newCollapsedState) {
            setExpandedItems([])
        }
    }

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-card transition-all duration-300",
                className,
            )}
        >
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Building className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">QN Edu System</h2>
                                <p className="text-xs text-muted-foreground">
                                    {user?.role === "center_owner" ? "Quản lý trung tâm" : "Giáo viên"}
                                </p>
                            </div>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCollapse}
                        className={cn("h-8 w-8 p-0", isCollapsed && "mx-auto")}
                    >
                        {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
                <div className="space-y-1 py-4">
                    {menuItems.map((item) => (
                        <div key={item.title}>
                            {(() => {
                                const isTopActive = pathname === item.href || (item.children?.some((c) => c.href === pathname) ?? false)
                                return (
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full h-10 transition-all text-[15px]",
                                            isCollapsed ? "justify-center px-0" : "justify-start gap-3 pr-2",
                                            isTopActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                                        )}
                                        onClick={() => {
                                            if (item.children) {
                                                if (!isCollapsed) toggleExpanded(item.title)
                                            } else {
                                                navigate(item.href)
                                            }
                                        }}
                                    >
                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                        {!isCollapsed && (
                                            <>
                                                <span className="flex-1 text-left">{item.title}</span>
                                                {item.children && (
                                                    <ChevronDown
                                                        className={cn(
                                                            "w-4 h-4 transition-transform",
                                                            expandedItems.includes(item.title) && "rotate-180",
                                                        )}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </Button>
                                )
                            })()}


                            {!isCollapsed && item.children && expandedItems.includes(item.title) && (
                                <div className="ml-7 space-y-1 mt-1">
                                    {item.children.map((child) => {
                                        const isActive = pathname === child.href
                                        return (
                                            <Button
                                                key={child.title}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(child.href)}
                                                className={cn(
                                                    "w-full justify-start text-[14px]",
                                                    isActive
                                                        ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                                                        : "text-muted-foreground hover:text-foreground",
                                                )}
                                            >
                                                {child.title}
                                            </Button>
                                        )
                                    })}
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
                        <Button
                            variant="ghost"
                            className={cn("w-full h-12 transition-all", isCollapsed ? "justify-center px-0" : "justify-start gap-3")}
                        >
                            <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src="/placeholder.svg" />
                                <AvatarFallback>
                                    {user?.fullName
                                        ?.split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <>
                                    <div className="flex-1 text-left">
                                        <p className="text-sm font-medium">{user?.fullName}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4" />
                                </>
                            )}
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
