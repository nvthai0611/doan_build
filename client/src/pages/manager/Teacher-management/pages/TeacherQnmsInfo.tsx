"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  Search,
  CalendarDays,
  Eye,
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

// Type for leave requests
type LeaveRequest = {
  id: number
  createdDate: string
  creator: string
  timeRange: string
  status: string
}

// Mock data for leave requests
const getLeaveRequests = (employeeId: string): LeaveRequest[] => {
  return []
}

// Mock data for timesheet
const getTimesheetData = (employeeId: string) => {
  return [
    {
      id: 1,
      sessionName: "Buổi 6",
      sessionTime: "23/09/2025 18:00 - 23/09/2025 19:00",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đã kết thúc",
      statusType: "completed",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
    {
      id: 2,
      sessionName: "Buổi 5",
      sessionTime: "18/09/2025 18:00 - 18/09/2025 19:00",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đã kết thúc",
      statusType: "completed",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
    {
      id: 3,
      sessionName: "Buổi 4",
      sessionTime: "11/09/2025 18:00 - 11/09/2025 19:00",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đã kết thúc",
      statusType: "completed",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
    {
      id: 4,
      sessionName: "Buổi 2",
      sessionTime: "04/09/2025 18:00 - 04/09/2025 19:00",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đã kết thúc",
      statusType: "completed",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
    {
      id: 5,
      sessionName: "Buổi 3",
      sessionTime: "03/09/2025 18:00 - 03/09/2025 19:00",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đã kết thúc",
      statusType: "completed",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
    {
      id: 6,
      sessionName: "Buổi 1",
      sessionTime: "21/09/2025 15:08",
      className: "PA4-3.5-18h00-T.Nam",
      classCode: "CCD-CAA82D3FA88B",
      status: "Đúng giờ",
      statusType: "on_time",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      checkInTime: "—",
      checkOutTime: "—",
      duration: "1 giờ",
      attendance: "Chưa điểm danh",
    },
  ]
}

// Mock data for classes
const getClassesData = (employeeId: string) => {
  return [
    {
      id: 1,
      classCode: "CCD-CAA82D3FA88B",
      className: "PA4-3.5-18h00-T.Nam",
      status: "Đang diễn ra",
      statusType: "ongoing",
      role: "Chưa cập nhật",
      roleType: "not_updated",
      startDate: "Thứ Ba 15:30 → 16:30",
      schedule: "Thứ Năm 16:30 → 17:30",
      present: 1,
      late: 0,
      absent: 0,
    },
  ]
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const navigate = useNavigate();
  const employeeId = params.id as string
  const employee = getEmployeeById(employeeId)

  const [activeTab, setActiveTab] = useState("general")
  const [accountStatus, setAccountStatus] = useState(employee?.accountStatus || false)
  const [isVerified, setIsVerified] = useState(true)

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 24))
  const [selectedMonth, setSelectedMonth] = useState("9")
  const [selectedYear, setSelectedYear] = useState("2025")

  // Leave requests state
  const [leaveActiveTab, setLeaveActiveTab] = useState("all")
  const [leaveFromDate, setLeaveFromDate] = useState("")
  const [leaveToDate, setLeaveToDate] = useState("")
  const [leaveSearch, setLeaveSearch] = useState("")

  // Timesheet state
  const [timesheetActiveTab, setTimesheetActiveTab] = useState("all")
  const [timesheetFromDate, setTimesheetFromDate] = useState("")
  const [timesheetToDate, setTimesheetToDate] = useState("")
  const [timesheetSearch, setTimesheetSearch] = useState("")

  // Classes state
  const [classesActiveTab, setClassesActiveTab] = useState("all")
  const [classesSearch, setClassesSearch] = useState("")

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Không tìm thấy nhân viên</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
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

  const renderLeaveRequestsTab = () => {
    const leaveRequests = getLeaveRequests(employeeId)
    const leaveTabs = [
      { key: "all", label: "Tất cả", count: 0 },
      { key: "new", label: "Mới", count: 0 },
      { key: "pending", label: "Chờ duyệt", count: 0 },
      { key: "approved", label: "Đã duyệt", count: 0 },
      { key: "cancelled", label: "Hủy", count: 0 },
    ]

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-foreground">Danh sách đơn xin nghỉ</h2>
        </div>

        <div className="p-6">
          {/* Status Tabs */}
          <div className="flex space-x-8 mb-6">
            {leaveTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setLeaveActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  leaveActiveTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={leaveFromDate}
                onChange={(e) => setLeaveFromDate(e.target.value)}
                className="pl-10"
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="relative">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={leaveToDate}
                onChange={(e) => setLeaveToDate(e.target.value)}
                className="pl-10"
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="relative">
              <Input
                placeholder="Tìm kiếm"
                value={leaveSearch}
                onChange={(e) => setLeaveSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Người tạo</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Không có dữ liệu</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  leaveRequests.map((request, index) => (
                    <TableRow key={request?.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{request.createdDate}</TableCell>
                      <TableCell>{request.creator}</TableCell>
                      <TableCell>{request.timeRange}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{request.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Switch />
              <span className="text-sm text-gray-600">Thu gọn</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Số hàng mỗi trang:</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">0-0 trong 0</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTimesheetTab = () => {
    const timesheetData = getTimesheetData(employeeId)
    const timesheetTabs = [
      { key: "all", label: "Tất cả", count: 6 },
      { key: "on_time", label: "Đúng giờ", count: 1 },
      { key: "late", label: "Đi muộn", count: 0 },
      { key: "absent", label: "Nghỉ", count: 0 },
      { key: "not_marked", label: "Chưa điểm danh", count: 5 },
    ]

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Bảng công</h2>
          <div className="text-sm text-gray-600">
            Tổng số giờ dạy: <span className="font-medium text-blue-600">6</span>
          </div>
        </div>

        <div className="p-6">
          {/* Status Tabs */}
          <div className="flex space-x-8 mb-6">
            {timesheetTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTimesheetActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  timesheetActiveTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Input
                type="date"
                placeholder="Từ ngày"
                value={timesheetFromDate}
                onChange={(e) => setTimesheetFromDate(e.target.value)}
                className="pl-10"
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="relative">
              <Input
                type="date"
                placeholder="Đến ngày"
                value={timesheetToDate}
                onChange={(e) => setTimesheetToDate(e.target.value)}
                className="pl-10"
              />
              <CalendarDays className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <div className="relative">
              <Input
                placeholder="Tìm kiếm theo tên buổi học, tên lớp, mã lớp"
                value={timesheetSearch}
                onChange={(e) => setTimesheetSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Buổi học</TableHead>
                  <TableHead>Lớp học</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Giờ đến → Giờ đi</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Điểm danh</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheetData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-blue-600 font-medium">{item.sessionName}</div>
                        <div className="text-xs text-gray-500">{item.sessionTime}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-blue-600">{item.className}</div>
                        <div className="text-xs text-gray-500">{item.classCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.statusType === "completed" ? "secondary" : "default"}
                        className={item.statusType === "completed" ? "bg-red-100 text-red-800" : ""}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {item.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.checkInTime}</TableCell>
                    <TableCell>{item.duration}</TableCell>
                    <TableCell>{item.attendance}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    )
  }

  const renderClassesTab = () => {
    const classesData = getClassesData(employeeId)
    const classesTabs = [
      { key: "all", label: "Tất cả", count: 1 },
      { key: "teaching", label: "Đang dạy", count: 1 },
      { key: "stopped", label: "Ngưng dạy", count: 0 },
    ]

    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-medium text-foreground">Danh sách lớp học đã tham gia giảng dạy</h2>
        </div>

        <div className="p-6">
          {/* Status Tabs */}
          <div className="flex space-x-8 mb-6">
            {classesTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setClassesActiveTab(tab.key)}
                className={`flex items-center gap-2 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  classesActiveTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên, mã lớp"
                value={classesSearch}
                onChange={(e) => setClassesSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Mã lớp học</TableHead>
                  <TableHead>Tên lớp</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Có mặt</TableHead>
                  <TableHead>Đi muộn</TableHead>
                  <TableHead>Nghỉ dạy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classesData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{item.classCode}</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {item.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-blue-600 font-medium">{item.className}</div>
                        <div className="text-xs text-gray-500">{item.startDate}</div>
                        <div className="text-xs text-gray-500">{item.schedule}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {item.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Đang dạy
                      </Badge>
                    </TableCell>
                    <TableCell>{item.present}</TableCell>
                    <TableCell>{item.late}</TableCell>
                    <TableCell>{item.absent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Switch />
              <span className="text-sm text-gray-600">Thu gọn</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Số hàng mỗi trang:</span>
              <Select defaultValue="10">
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">1-1 trong 1</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
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

        {activeTab === "leave" && renderLeaveRequestsTab()}
        {activeTab === "timesheet" && renderTimesheetTab()}
        {activeTab === "classes" && renderClassesTab()}

        {/* Other tab content placeholders */}
        {!["general", "schedule", "leave", "timesheet", "classes"].includes(activeTab) && (
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
