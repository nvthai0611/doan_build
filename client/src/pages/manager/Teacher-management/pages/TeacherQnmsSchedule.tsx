"use client"

import { useState } from "react"
// import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  User,
  Clock,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  PhoneCall,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

// Mock teaching sessions data
const getTeachingSessions = (employeeId: string, year: number, month: number) => {
  const sessions = [
    { id: 1, date: new Date(2025, 8, 2), title: "Buổi 1", hasAlert: true },
    { id: 2, date: new Date(2025, 8, 3), title: "Buổi 3", hasAlert: true },
    { id: 3, date: new Date(2025, 8, 4), title: "Buổi 2", hasAlert: true },
    { id: 4, date: new Date(2025, 8, 11), title: "Buổi 4", hasAlert: true },
    { id: 5, date: new Date(2025, 8, 18), title: "Buổi 5", hasAlert: true },
    { id: 6, date: new Date(2025, 8, 23), title: "Buổi 6", hasAlert: true },
    { id: 7, date: new Date(2025, 8, 25), title: "Buổi 7", hasAlert: false },
    { id: 8, date: new Date(2025, 8, 30), title: "Buổi 8", hasAlert: false },
  ]

  return sessions.filter((session) => session.date.getFullYear() === year && session.date.getMonth() === month)
}

// Mock employee data - in real app this would come from API
const getEmployeeById = (id: string) => {
  const employees = [
    {
      id: 1,
      name: "Ngô Quốc Tú",
      email: "nvthai061105@gmail.com",
      phone: "0386828929",
      username: "check@centerup",
      code: "EMP-6C6A927B7D3D",
      role: "Giáo viên",
      gender: "Nam",
      status: true,
      verifiedPhone: "0386828929",
      verifiedEmail: "nvthai061105@gmail.com",
      loginUsername: "check@centerup",
      accountStatus: true,
      notes: "",
    },
    {
      id: 2,
      name: "Hòa Gấm Bi",
      email: "mythai06105@gmail.com",
      phone: "0386828929",
      username: "haogambi@centerup",
      code: "***6480A",
      role: "Giáo viên",
      gender: "Nam",
      status: true,
      verifiedPhone: "0386828929",
      verifiedEmail: "mythai06105@gmail.com",
      loginUsername: "haogambi@centerup",
      accountStatus: true,
      notes: "",
    },
  ]

  return employees.find((emp) => emp.id === Number.parseInt(id))
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const employeeId = params.id as string
  const employee = getEmployeeById(employeeId)

  const [activeTab, setActiveTab] = useState("general")
  const [accountStatus, setAccountStatus] = useState(employee?.accountStatus || false)
  const [isVerified, setIsVerified] = useState(true)

  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 24)) // September 24, 2025
  const [selectedMonth, setSelectedMonth] = useState("9")
  const [selectedYear, setSelectedYear] = useState("2025")

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Không tìm thấy nhân viên</h1>
          <Button onClick={() => navigate('/')} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: "general", label: "Thông tin chung", icon: User },
    { key: "schedule", label: "Lịch dạy", icon: Clock },
    { key: "work", label: "Công việc", icon: Briefcase },
    { key: "classes", label: "Lớp học", icon: GraduationCap },
    { key: "timesheet", label: "Bảng công", icon: Calendar },
    { key: "leave", label: "Đơn xin nghỉ", icon: FileText },
    { key: "calls", label: "Nhật ký cuộc gọi", icon: PhoneCall },
  ]

  const handleAccountStatusToggle = () => {
    setAccountStatus(!accountStatus)
    console.log(`[v0] Toggled account status for employee ${employee.name}`)
  }

  const handleEditEmployee = () => {
    console.log(`[v0] Edit employee ${employee.name}`)
    alert(`Chỉnh sửa thông tin ${employee.name}`)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    setSelectedMonth((newDate.getMonth() + 1).toString())
    setSelectedYear(newDate.getFullYear().toString())
    console.log(
      `[v0] Navigated to ${direction === "prev" ? "previous" : "next"} month: ${newDate.getMonth() + 1}/${newDate.getFullYear()}`,
    )
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedMonth((today.getMonth() + 1).toString())
    setSelectedYear(today.getFullYear().toString())
    console.log(`[v0] Navigated to today: ${today.getMonth() + 1}/${today.getFullYear()}`)
  }

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month)
    const newDate = new Date(currentDate)
    newDate.setMonth(Number.parseInt(month) - 1)
    setCurrentDate(newDate)
    console.log(`[v0] Changed month to: ${month}`)
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const today = new Date()

    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()

    const sessions = getTeachingSessions(employeeId, year, month)

    const days = []

    // Previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i
      days.push(
        <div key={`prev-${day}`} className="h-24 p-2 text-gray-400 text-sm">
          {day}
        </div>,
      )
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      const daySessions = sessions.filter((session) => session.date.getDate() === day)

      days.push(
        <div key={day} className="h-24 p-2 border-r border-b border-gray-100">
          <div
            className={`text-sm font-medium mb-1 ${isToday ? "bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-900"}`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {daySessions.map((session) => (
              <div
                key={session.id}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <span>{session.title}</span>
                {session.hasAlert && <AlertTriangle className="w-3 h-3 text-orange-400" />}
              </div>
            ))}
          </div>
        </div>,
      )
    }

    // Next month's leading days
    const remainingCells = 42 - days.length
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div key={`next-${day}`} className="h-24 p-2 text-gray-400 text-sm">
          {day}
        </div>,
      )
    }

    return days
  }

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ]

  const weekDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-foreground">Chi tiết nhân viên {employee.name}</h1>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/teachers" className="text-muted-foreground hover:text-foreground">
                      Danh sách nhân viên
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-foreground font-medium">Chi tiết nhân viên</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "general" && (
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Section Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-medium text-foreground">Thông tin chung</h2>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <Button variant="outline" size="sm" onClick={handleEditEmployee} className="gap-2 bg-transparent">
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </Button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Avatar and Status */}
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-32 h-32 mb-4">
                      <AvatarFallback className="bg-gray-200 text-2xl">
                        <User className="w-16 h-16 text-gray-400" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="space-y-3 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trạng thái tài khoản</span>
                        <Switch checked={accountStatus} onCheckedChange={handleAccountStatusToggle} />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-600">Đã xác thực</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Employee Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Họ tên</label>
                      <div className="text-base font-medium text-gray-900">{employee.name}</div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Mã nhân viên</label>
                      <div className="text-base text-gray-900">{employee.code}</div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Email</label>
                      <div className="flex items-center gap-2 text-base text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {employee.email}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Số điện thoại</label>
                      <div className="flex items-center gap-2 text-base text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {employee.phone}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Nhóm quyền</label>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {employee.role}
                      </Badge>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Ghi chú</label>
                      <div className="text-base text-gray-900">{employee.notes || "-"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Login Account Information Section */}
            <div className="border-t">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h3 className="text-base font-medium text-gray-900">Thông tin tài khoản đăng nhập</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Tên đăng nhập</label>
                    <div className="text-base text-blue-600 font-medium">{employee.loginUsername}</div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Số điện thoại xác thực</label>
                    <div className="text-base text-blue-600">{employee.verifiedPhone}</div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Email xác thực</label>
                    <div className="text-base text-blue-600">{employee.verifiedEmail}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-medium text-foreground">Lịch dạy</h2>
              </div>

              <div className="p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {monthNames[currentDate.getMonth()]}, {currentDate.getFullYear()}
                  </h3>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Hôm nay
                    </Button>

                    <Select value={selectedMonth} onValueChange={handleMonthChange}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Tháng {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 bg-gray-50">
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="p-3 text-sm font-medium text-gray-700 text-center border-r border-gray-200 last:border-r-0"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7">{renderCalendar()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tab content placeholders */}
        {activeTab !== "general" && activeTab !== "schedule" && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                {tabs.find((tab) => tab.key === activeTab)?.icon &&
                  (() => {
                    const Icon = tabs.find((tab) => tab.key === activeTab)!.icon
                    return <Icon className="w-12 h-12 mx-auto" />
                  })()}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {tabs.find((tab) => tab.key === activeTab)?.label}
              </h3>
              <p className="text-gray-600">Nội dung sẽ được cập nhật sau</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
