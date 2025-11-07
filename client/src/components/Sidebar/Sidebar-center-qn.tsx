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
    ChevronRight,
    AlertTriangle,
    FileText,
    Briefcase,
    CircleDollarSign,
    ChartArea,
    FileCheck,
    Clock,
    FolderOpen,
    CheckSquare
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
    className?: string
    onToggleCollapse?: (collapsed: boolean) => void
}

interface MenuItem {
  title: string
  icon?: any
  href?: string
  children?: MenuItem[]
  hasArrowRight?: boolean
  badge?: string
}

interface MenuSection {
  title: string
  items: MenuItem[]
}

const centerOwnerMenuItems: { topLevel: MenuItem[], sections: MenuSection[] } = {
  topLevel: [
    {
      title: 'Trang chủ',
      icon: Home,
      href: '/center-qn',
    },
    {
      title: 'Báo cáo',
      icon: ChartArea,
      href: '/center-qn/reports',
      hasArrowRight: true,
      children: [
        { title: 'Báo cáo tổng quan', href: '/center-qn/reports/dashboard' },
        { title: 'Báo cáo học phí', href: '/center-qn/reports/tuition' },
        { title: 'Báo cáo kết quả', href: '/center-qn/reports/results' },
      ],
    },
    {
      title: 'Khách hàng',
      icon: Users,  
      href: '/center-qn/customers',
      // children: [
      //   { title: 'Danh sách khách hàng', href: '/center-qn/customers' },
      //   { title: 'Thông tin khách hàng', href: '/center-qn/customers/info' },
      //   { title: 'Quản lý khách hàng', href: '/center-qn/customers/manage' },
      //   { title: 'Quản lý khách hàng', href: '/center-qn/customers/manage' },
      // ]
    },
    {
      title: 'Lịch dạy toàn trung tâm',
      icon: Calendar,
      href: '/center-qn/schedule',
    },

  ],
  sections: [
    {
      title: 'GIẢNG DẠY',
      items: [
        {
          title: 'Quản lý học sinh',
          icon: GraduationCap,
          href: '/center-qn/students',
          children: [
            { title: 'Danh sách học sinh', href: '/center-qn/students' },
            { title: 'Thông tin phụ huynh', href: '/center-qn/parents' },
          ],
        },
        
        {
          title: 'Lớp học',
          icon: BookOpen,
          href: '/center-qn/classes',
        },
        {
          title: 'Giáo viên',
          icon: Users,
          href: '/center-qn/teachers',
          children: [
            { title: 'Danh sách giáo viên',
                icon: GraduationCap,
                href: '/center-qn/teachers' },

            // { title: 'Thông tin chuyên môn', href: '/center-qn/teachers/expertise' },
            // { title: 'Quản lý lương', href: '/center-qn/teachers/salary' },
            // { title: 'Đánh giá từ PH/HS', href: '/center-qn/teachers/reviews' },
            // { title: 'Đổi lịch dạy', href: '/center-qn/teachers/schedule-changes' },
            {
              title: 'Quản lý yêu cầu',
              icon: FileText,
              href: '/center-qn/requests',
              children: [
                {
                  title: 'Đơn xin nghỉ phép',
                  href: '/center-qn/requests/leave-requests',
                },
                {
                  title: 'Yêu cầu đổi lịch',
                  href: '/center-qn/requests/change-schedule-requests',
                },
                {
                  title: 'Yêu cầu tạo buổi học',
                  href: '/center-qn/requests/session-requests',
                },
              ],
            },
          ],
        },
        { 
            title: 'Buổi học hôm nay',
            icon: Clock,
            href: '/center-qn/lich-day-hom-nay',
          },
      ],
    },
    {
      title: 'QUẢN LÝ',
      items: [
        {
          title: 'Tài chính',
          icon: DollarSign,
          href: '/finance',
          children: [
            { title: 'Hóa đơn giáo viên', href: '/center-qn/payroll-teacher' },
            { title: 'Định nghĩa học phí', href: '/finance/tuition' },
            { title: 'Phiếu thu - chi', href: '/finance/receipts' },
            { title: 'Thanh toán online', href: '/finance/online-payment' },
            { title: 'Báo cáo thu chi', href: '/finance/reports' },
            { title: 'Nợ học phí', href: '/finance/debts' },
            { title: 'Học bổng & Giảm phí', href: '/finance/scholarships' },
          ],
        },
        {
          title: 'Quản lý môn học',
          icon: BookOpen,
          href: '/center-qn/courses',
        },
        {
          title: 'Quản lý phòng học',
          icon: Building,
          href: '/center-qn/rooms',
        },
        {
          title: 'Truyền thông',
          icon: MessageSquare,
          href: '/center-qn/communication',
          children: [
            { title: 'Thông báo chung', href: '/center-qn/communication/announcements' },
            { title: 'Học sinh tiêu biểu', href: '/center-qn/communication/showcases' },
            { title: 'Quản lý sự kiện', href: '/center-qn/communication/events' },
            { title: 'Họp phụ huynh', href: '/center-qn/communication/parent-meetings' },
            { title: 'Hoạt động ngoại khóa', href: '/center-qn/communication/activities' },
            { title: 'Thông báo tự động', href: '/center-qn/communication/auto-notifications' },
          ],
        },
        {
          title: 'Quản lý người dùng',
          icon: UserCog,
          href: '/users',
        },
        {
          title: 'Feedback Phụ Huynh',
          icon: MessageSquare,
          href: '/center-qn/feedback',
        },
        {
          title: 'Báo cáo sự cố',
          icon: AlertTriangle,
          href: '/center-qn/incidents',
        },
      ],
    },
    {
      title: 'HỆ THỐNG',
      items: [
        {
          title: 'Cài đặt',
          icon: Settings,
          href: '/center-qn/settings',
          children: [
            {
              title: 'Thông tin trung tâm',
              href: '/center-qn/settings/center-info-setting',
            },
            { title: 'Ngày nghỉ', href: '/center-qn/settings/holidays-setting' },
            { title: 'Học phí', href: '/center-qn/settings/tuition-setting' },
            { title: 'Bài kiểm tra', href: '/center-qn/settings/score-setting' },
            { title: 'Thông báo', href: '/center-qn/settings/notifications-setting' },
          ],
        },
      ],
    },
  ],
};

const teacherMenuItems = [
  {
    title: 'Tổng quan',
    icon: Home,
    href: '/teacher/profile',
  },
  {
    title: 'Quản lý lớp học',
    icon: Users,
    href: '/teacher/classes',
    children: [
      { title: 'Lớp được phân công', href: '/teacher/classes' },
      { title: 'Thống kê tiến độ', href: '/teacher/classes/progress' },
    ],
  },
  // {
  //     title: "Điểm danh",
  //     icon: UserCheck,
  //     href: "/teacher/attendance",
  // },
  {
    title: 'Quản lý điểm',
    icon: Target,
    href: '/teacher/grades',
    children: [
      { title: 'Nhập điểm kiểm tra', href: '/teacher/grades/input' },
      { title: 'Xem điểm học sinh', href: '/teacher/grades/view' },
      { title: 'Đánh giá học sinh', href: '/teacher/grades/evaluation' },
      { title: 'Nhận xét định kỳ', href: '/teacher/grades/comments' },
    ],
  },
  {
    title: 'Tài liệu',
    icon: Upload,
    href: '/teacher/documents',
    children: [
      { title: 'Upload tài liệu', href: '/teacher/documents/upload' },
      { title: 'Quản lý files', href: '/teacher/documents/manage' },
    ],
  },
  {
    title: 'Lịch dạy cá nhân',
    icon: Calendar,
    href: '/teacher/schedule',
  },
  {
    title: 'Quản lý yêu cầu',
    icon: FileText,
    href: '/teacher/requests',
    children: [
      { title: 'Đơn xin nghỉ', href: '/teacher/requests/leave' },
      { title: 'Đơn của tôi', href: '/teacher/requests/my-requests' },
      { title: 'Đơn nghỉ học sinh', href: '/teacher/requests/student-leave-requests' },
    ],
  },
  {
    title: 'Báo cáo sự cố',
    icon: AlertTriangle,
    href: '/teacher/incidents',
    children: [
      { title: 'Báo cáo sự cố mới', href: '/teacher/incidents/report' },
      { title: 'Quản lý báo cáo', href: '/teacher/incidents/manage' },
    ],
  },
  {
    title: 'Quản lý hợp đồng',
    icon: Briefcase,
    href: '/teacher/contracts',
  },
  {
    title: 'Thông tin cá nhân',
    icon: Settings,
    href: '/teacher/profile',
  },
];
const studentMenuItems = [
    {
        title: "Tổng quan",
        icon: Home,
        href: "/student",
        children: undefined,
    },
    {
        title: "Lớp học của tôi",
        icon: Users,
        href: "/student/my-classes",
        children: undefined,
    },

    {
        title: "Lịch học",
        icon: Calendar,
        href: "/student/my-schedule",
        children: undefined,
    },

    {
        title: "Bảng điểm",
        icon: Target,
        href: "/student/my-grades",
        children: undefined,
    },



]

const parentMenuItems = [
    {
        title: "Tổng quan",
        icon: Home,
        href: "/parent/dashboard",
    },
    {
        title: "Đăng ký khoá học",
        icon: Target,
        href: "/parent/recruiting-classes",
    },
    {
        title: "Lớp học",
        icon: BookOpen,
        href: "/parent/classes",
    },
    {
        title: "Lịch học",
        icon: Calendar,
        href: "/parent/schedule",
    },
    {
        title: "Các con của tôi",
        icon: Users,
        href: "/parent/children",
    },
    {
        title: "Hóa đơn học phí",
        icon: CircleDollarSign,
        href: "/parent/financial",
    },
    {
        title: "Đơn nghỉ học",
        icon: FileText,
        href: "/parent/student-leave-requests",
    },
    {
        title: "Cam kết học tập",
        icon: FileCheck,
        href: "/parent/commitments",
    },

]

export function SidebarCenterQn({ className, onToggleCollapse }: SidebarProps) {
    const { user, logout } = useAuth()
    const [expandedItems, setExpandedItems] = useState<string[]>([])
    const [isCollapsed, setIsCollapsed] = useState(false)
    const navigate = useNavigate()
    const { pathname } = useLocation()
    
    const isCenterOwner = user?.role === "center_owner"
    const menuItems = isCenterOwner ? null : (user?.role === "teacher" ? teacherMenuItems : user?.role === "student" ? studentMenuItems : parentMenuItems)
    const centerOwnerMenu = isCenterOwner ? centerOwnerMenuItems : null

    // Helper function to check if item should be expanded
    const shouldExpandItem = (item: MenuItem) => {
        if (!item.children) return false
        const isMatch = item.href && pathname.startsWith(item.href) && item.href !== '/'
        const hasChildMatch = item.children.some((c: MenuItem) =>
            c.href && (pathname === c.href || pathname.startsWith(c.href))
        )
        return isMatch || hasChildMatch
    }

    // Helper function to check and expand nested items recursively
    const checkAndExpandNested = (item: MenuItem, level: number = 0) => {
        const itemKey = level === 0 ? item.title : `${item.title}-${level}`
        if (shouldExpandItem(item) && !expandedItems.includes(itemKey)) {
            setExpandedItems(prev => [...prev, itemKey])
        }
        // Recursively check children
        item.children?.forEach((child) => {
            if (child.children) {
                checkAndExpandNested(child, level + 1)
            }
        })
    }

    useEffect(() => {
        if (!isCollapsed) {
            // Handle center owner menu structure
            if (centerOwnerMenu) {
                // Check top level items
                centerOwnerMenu.topLevel.forEach((item) => {
                    checkAndExpandNested(item, 0)
                })
                // Check section items
                centerOwnerMenu.sections.forEach((section) => {
                    section.items.forEach((item) => {
                        checkAndExpandNested(item, 0)
                    })
                })
            } else if (menuItems) {
                // Handle old structure for other roles
                menuItems.forEach((item: any) => {
                    if ((item as any).children) {
                        const isMatch = item.href && pathname.startsWith(item.href) && item.href !== '/'
                        const hasChildMatch = (item as any).children.some((c: any) =>
                            c.href && (pathname === c.href || pathname.startsWith(c.href))
                        )

                        if ((isMatch || hasChildMatch) && !expandedItems.includes(item.title)) {
                            setExpandedItems(prev => [...prev, item.title])
                        }
                    }
                })
            }
        }
    }, [pathname, isCollapsed])

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

    // Helper function to render children items (supports nested)
    const renderChildren = (children: MenuItem[], level: number = 1) => {
        const marginLeftClass = level === 1 ? 'ml-7' : level === 2 ? 'ml-14' : 'ml-21'
        return children.map((child: MenuItem) => {
            const hasChildren = child.children && child.children.length > 0
            const childKey = `${child.title}-${level}`
            const isExpanded = expandedItems.includes(childKey)
            const isExactActive = pathname === child.href
            const hasChildMatch = child.children?.some((c: MenuItem) =>
                c.href && (pathname === c.href || pathname.startsWith(c.href))
            )
            const isPartialActive = child.href && pathname.startsWith(child.href) && child.href !== '/' && !isExactActive
            const isChildActive = isExactActive || isPartialActive || hasChildMatch

            return (
                <div key={childKey}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            if (hasChildren) {
                                toggleExpanded(childKey)
                            } else if (child.href) {
                                navigate(child.href)
                            }
                        }}
                        className={cn(
                            "w-full justify-start text-[14px] gap-2",
                            marginLeftClass,
                            isChildActive
                                ? "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {child.icon && <child.icon className="w-4 h-4 flex-shrink-0" />}
                        <span className="flex-1 text-left">{child.title}</span>
                        {hasChildren && (
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 transition-transform ml-auto",
                                    isExpanded && "rotate-180",
                                )}
                            />
                        )}
                    </Button>
                    {hasChildren && isExpanded && (
                        <div className="space-y-1 mt-1">
                            {renderChildren(child.children || [], level + 1)}
                        </div>
                    )}
                </div>
            )
        })
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
                                    {user?.role === "center_owner" ? "Quản lý trung tâm" : user?.role === "teacher" ? "Giáo viên" : "Phụ Huynh/Học Sinh"}
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
                    {centerOwnerMenu ? (
                        <>
                            {/* Top Level Items */}
                            {centerOwnerMenu.topLevel.map((item) => {
                                const isExactMatch = pathname === item.href
                                const hasChildMatch = item.children?.some((c: MenuItem) => c.href === pathname)
                                const isPartialMatch = item.href && pathname.startsWith(item.href) && item.href !== '/' && !isExactMatch
                                const isActive = isExactMatch || hasChildMatch || isPartialMatch
                                const isExpanded = expandedItems.includes(item.title)
                                const hasChildren = item.children && item.children.length > 0

                                return (
                                    <div key={item.title}>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-10 transition-all text-[15px]",
                                                isCollapsed ? "justify-center px-0" : "justify-start gap-3 pr-2",
                                                isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                                            )}
                                            onClick={() => {
                                                if (hasChildren) {
                                                    if (!isCollapsed) toggleExpanded(item.title)
                                                } else if (item.href) {
                                                    navigate(item.href)
                                                }
                                            }}
                                        >
                                            <item.icon className="w-4 h-4 flex-shrink-0" />
                                            {hasChildren && isCollapsed && (
                                                <ChevronDown className="w-4 h-4" />
                                            )}
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left">{item.title}</span>
                                                    {item.badge && (
                                                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {hasChildren && (
                                                        <ChevronDown
                                                            className={cn(
                                                                "w-4 h-4 transition-transform",
                                                                isExpanded && "rotate-180",
                                                            )}
                                                        />
                                                    )}
                                                    {item.hasArrowRight && !hasChildren && (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </>
                                            )}
                                        </Button>

                                        {/* Children */}
                                        {!isCollapsed && hasChildren && isExpanded && (
                                            <div className="space-y-1 mt-1">
                                                {renderChildren(item.children || [], 1)}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Sections */}
                            {centerOwnerMenu.sections.map((section) => (
                                <div key={section.title} className={cn("mt-4", isCollapsed && "hidden")}>
                                    {/* Section Header */}
                                    <div className="px-3 py-2 text-xs font-bold text-foreground uppercase tracking-wider">
                                        {section.title}
                                    </div>
                                    
                                    {/* Section Items */}
                                    <div className="space-y-1 mt-1">
                                        {section.items.map((item) => {
                                            const isExactMatch = pathname === item.href
                                            const hasChildMatch = item.children?.some((c: MenuItem) => c.href === pathname)
                                            const isPartialMatch = item.href && pathname.startsWith(item.href) && item.href !== '/' && !isExactMatch
                                            const isActive = isExactMatch || hasChildMatch || isPartialMatch
                                            const isExpanded = expandedItems.includes(item.title)
                                            const hasChildren = item.children && item.children.length > 0

                                            return (
                                                <div key={item.title}>
                                                    <Button
                                                        variant="ghost"
                                                        className={cn(
                                                            "w-full h-10 transition-all text-[15px]",
                                                            isCollapsed ? "justify-center px-0" : "justify-start gap-3 pr-2",
                                                            isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                                                        )}
                                                        onClick={() => {
                                                            if (hasChildren) {
                                                                if (!isCollapsed) toggleExpanded(item.title)
                                                            } else if (item.href) {
                                                                navigate(item.href)
                                                            }
                                                        }}
                                                    >
                                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                                        {hasChildren && isCollapsed && (
                                                            <ChevronDown className="w-4 h-4" />
                                                        )}
                                                        {!isCollapsed && (
                                                            <>
                                                                <span className="flex-1 text-left">{item.title}</span>
                                                                {hasChildren && (
                                                                    <ChevronDown
                                                                        className={cn(
                                                                            "w-4 h-4 transition-transform",
                                                                            isExpanded && "rotate-180",
                                                                        )}
                                                                    />
                                                                )}
                                                                {item.hasArrowRight && !hasChildren && (
                                                                    <ChevronRight className="w-4 h-4" />
                                                                )}
                                                            </>
                                                        )}
                                                    </Button>

                                                    {/* Children */}
                                                    {!isCollapsed && hasChildren && isExpanded && (
                                                        <div className="space-y-1 mt-1">
                                                            {renderChildren(item.children || [], 1)}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        /* Old structure for other roles */
                        menuItems?.map((item: any) => (
                            <div key={item.title}>
                                {(() => {
                                    const isExactMatch = pathname === item.href
                                    const hasChildMatch = (item as any).children?.some((c: any) => c.href === pathname)
                                    const isPartialMatch = pathname.startsWith(item.href) && item.href !== '/' && !isExactMatch
                                    const isTopActive = isExactMatch || hasChildMatch || isPartialMatch

                                    return (
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "w-full h-10 transition-all text-[15px]",
                                                isCollapsed ? "justify-center px-0" : "justify-start gap-3 pr-2",
                                                isTopActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
                                            )}
                                            onClick={() => {
                                                if ((item as any).children) {
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
                                                    {(item as any).children && (
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

                                {!isCollapsed && (item as any).children && expandedItems.includes(item.title) && (
                                    <div className="ml-7 space-y-1 mt-1">
                                        {(item as any).children.map((child: any) => {
                                            const isExactActive = pathname === child.href
                                            const isPartialActive = pathname.startsWith(child.href) && child.href !== '/' && !isExactActive
                                            const isActive = isExactActive || isPartialActive

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
                        ))
                    )}
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
                        <DropdownMenuItem onClick={async () => {
                            // Lưu role trước khi logout (vì sau logout user sẽ null)
                            const currentRole = user?.role
                            await logout()
                            // Redirect về đúng cổng dựa trên role
                            if (currentRole === 'parent' || currentRole === 'student') {
                                navigate('/auth/login/family')
                            } else if(currentRole === 'center_owner' || currentRole === 'teacher') {
                                // center_owner, teacher, admin → cổng quản lý
                                navigate('/auth/login/management')
                            } else if(currentRole === 'admin') {
                                navigate('/auth/login/admin')
                            }
                        }}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}
