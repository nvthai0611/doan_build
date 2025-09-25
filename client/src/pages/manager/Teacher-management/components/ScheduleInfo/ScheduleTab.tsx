"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { teacherService } from "../../../../../services/teacherService"
import Loading from "../../../../../components/Loading/LoadingPage"

interface ScheduleTabProps {
  employeeId: string
  currentDate: Date
  selectedMonth: string
  selectedYear: string
  setCurrentDate: (date: Date) => void
  setSelectedMonth: (month: string) => void
  setSelectedYear: (year: string) => void
}

interface TeachingSession {
  id: number
  date: Date
  title: string
  time: string
  subject: string
  class: string
  room: string
  hasAlert: boolean
  status: "scheduled" | "completed" | "cancelled"
  teacher: string
  students: Array<{
    id: string
    name: string
    avatar?: string
    status: "present" | "absent" | "late"
  }>
  attendanceWarnings: string[]
  description?: string
  materials?: string[]
}

// Hook để gọi API lịch dạy
const useTeachingSessions = (employeeId: string, year: number, month: number) => {
  console.log(year, month);
  
  const [sessions, setSessions] = useState<TeachingSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSessions = async () => {
      if (!employeeId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const response = await teacherService.getTeacherSchedule(employeeId, year, month)
        console.log('Schedule API Response:', response)
        
        if (response.data && (response.data as any).sessions) {
          const formattedSessions: TeachingSession[] = (response.data as any).sessions.map((session: any) => ({
            id: parseInt(session.id.replace(/-/g, '').substring(0, 8), 16),
            date: new Date(session.date),
            title: session.title,
            time: session.time,
            subject: session.subject,
            class: session.class,
            room: session.room,
            hasAlert: session.hasAlert,
            status: session.status,
            teacher: session.teacher,
            students: session.students || [],
            attendanceWarnings: session.attendanceWarnings || [],
            description: session.description,
            materials: session.materials || []
          }))
          setSessions(formattedSessions)
        } else {
          // Fallback to mock data nếu API không trả về dữ liệu
          setSessions(getMockSessions(year, month))
        }
      } catch (err) {
        console.error('Error fetching schedule:', err)
        // Fallback to mock data khi có lỗi
        setSessions(getMockSessions(year, month))
        setError('Không thể tải dữ liệu từ server, hiển thị dữ liệu mẫu')
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [employeeId, year, month])

  return { sessions, loading, error }
}

// Mock data fallback
const getMockSessions = (year: number, month: number): TeachingSession[] => {
  const sessions: TeachingSession[] = [
    // Tháng 9/2025 (month = 8)
    {
      id: 1,
      date: new Date(2025, 8, 2),
      title: "Buổi 1",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10A",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "1", name: "Nguyễn Văn A", status: "present" },
        { id: "2", name: "Trần Thị B", status: "absent" },
        { id: "3", name: "Lê Văn C", status: "present" },
      ],
      attendanceWarnings: [
        "*Có 2 học viên chưa điểm danh*",
        "*Có 2 học viên chưa được chấm điểm tiểu chí buổi học*",
        "*Có 1 giáo viên chưa điểm danh*",
      ],
      description: "Phương học: Chưa cập nhật",
      materials: ["Sách giáo khoa Toán 10", "Bài tập thực hành"],
    },
    {
      id: 2,
      date: new Date(2025, 8, 2),
      title: "Buổi 2",
      time: "14:00-16:00",
      subject: "Vật lý",
      class: "11B",
      room: "P102",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "4", name: "Phạm Văn D", status: "present" },
        { id: "5", name: "Hoàng Thị E", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Thí nghiệm vật lý",
    },
    {
      id: 3,
      date: new Date(2025, 8, 3),
      title: "Buổi 3",
      time: "10:00-12:00",
      subject: "Hóa học",
      class: "12A",
      room: "P103",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "6", name: "Vũ Văn F", status: "late" },
        { id: "7", name: "Đỗ Thị G", status: "present" },
        { id: "8", name: "Bùi Văn H", status: "absent" },
      ],
      attendanceWarnings: ["*Có 1 học viên đi muộn*", "*Có 1 học viên vắng mặt*"],
      description: "Phương học: Thí nghiệm hóa học",
    },
    {
      id: 4,
      date: new Date(2025, 8, 4),
      title: "Buổi 2",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10B",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "9", name: "Cao Văn I", status: "present" },
        { id: "10", name: "Lý Thị K", status: "present" },
      ],
      attendanceWarnings: ["*Có 1 giáo viên chưa điểm danh*"],
      description: "Phương học: Chưa cập nhật",
    },
    {
      id: 5,
      date: new Date(2025, 8, 11),
      title: "Buổi 4",
      time: "10:00-12:00",
      subject: "Vật lý",
      class: "11A",
      room: "P102",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "11", name: "Mai Văn L", status: "present" },
        { id: "12", name: "Tô Thị M", status: "present" },
        { id: "13", name: "Hồ Văn N", status: "absent" },
      ],
      attendanceWarnings: ["*Có 1 học viên vắng mặt*"],
      description: "Phương học: Lý thuyết và thực hành",
    },
    {
      id: 6,
      date: new Date(2025, 8, 18),
      title: "Buổi 5",
      time: "14:00-16:00",
      subject: "Tiếng Anh",
      class: "12B",
      room: "P104",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "14", name: "Đinh Văn O", status: "present" },
        { id: "15", name: "Võ Thị P", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Giao tiếp tiếng Anh",
    },
    {
      id: 7,
      date: new Date(2025, 8, 23),
      title: "Buổi 6",
      time: "08:00-10:00",
      subject: "Toán học",
      class: "10B",
      room: "P101",
      hasAlert: true,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "16", name: "Phan Văn Q", status: "present" },
        { id: "17", name: "Dương Thị R", status: "late" },
      ],
      attendanceWarnings: ["*Có 1 học viên đi muộn*"],
      description: "Phương học: Giải bài tập nâng cao",
    },
    {
      id: 8,
      date: new Date(2025, 8, 25),
      title: "Buổi 7",
      time: "10:00-12:00",
      subject: "Vật lý",
      class: "11A",
      room: "P102",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "18", name: "Lương Văn S", status: "present" },
        { id: "19", name: "Chu Thị T", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Ôn tập kiểm tra",
    },
    {
      id: 9,
      date: new Date(2025, 8, 30),
      title: "Buổi 8",
      time: "14:00-16:00",
      subject: "Hóa học",
      class: "12A",
      room: "P103",
      hasAlert: false,
      status: "scheduled",
      teacher: "Ngô Quốc Tu",
      students: [
        { id: "20", name: "Trịnh Văn U", status: "present" },
        { id: "21", name: "Đặng Thị V", status: "present" },
      ],
      attendanceWarnings: [],
      description: "Phương học: Thí nghiệm tổng hợp",
    },
  ]

  return sessions.filter((session) => session.date.getFullYear() === year && session.date.getMonth() === month)
}

export default function ScheduleTab({
  employeeId,
  currentDate,
  selectedMonth,
  selectedYear,
  setCurrentDate,
  setSelectedMonth,
  setSelectedYear,
}: ScheduleTabProps) {
  const [selectedSession, setSelectedSession] = useState<TeachingSession | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const { sessions, loading, error } = useTeachingSessions(
    employeeId, 
    Number.parseInt(selectedYear), 
    Number.parseInt(selectedMonth) 
  )

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  const firstDay = getFirstDayOfMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

  const getSessionsForDay = (day: number) => {
    const dayDate = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1, day)
    return sessions.filter(
      (session) =>
        session.date.getDate() === day &&
        session.date.getMonth() === dayDate.getMonth() &&
        session.date.getFullYear() === dayDate.getFullYear(),
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    const dayDate = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1, day)
    return today.toDateString() === dayDate.toDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      "Toán học": "bg-purple-500 text-white",
      "Vật lý": "bg-blue-500 text-white",
      "Hóa học": "bg-green-500 text-white",
      "Tiếng Anh": "bg-yellow-500 text-white",
      "Ngữ văn": "bg-pink-500 text-white",
    }
    return colors[subject] || "bg-gray-500 text-white"
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const currentMonth = Number.parseInt(selectedMonth)
    const currentYear = Number.parseInt(selectedYear)

    if (direction === "prev") {
      if (currentMonth === 1) {
        setSelectedMonth("12")
        setSelectedYear((currentYear - 1).toString())
      } else {
        setSelectedMonth((currentMonth - 1).toString())
      }
    } else {
      if (currentMonth === 12) {
        setSelectedMonth("1")
        setSelectedYear((currentYear + 1).toString())
      } else {
        setSelectedMonth((currentMonth + 1).toString())
      }
    }
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedMonth((today.getMonth() + 1).toString())
    setSelectedYear(today.getFullYear().toString())
    setCurrentDate(today)
  }

  const handleSessionClick = (session: TeachingSession) => {
    setSelectedSession(session)
    setIsDialogOpen(true)
  }

  const getStudentStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "absent":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStudentStatusText = (status: string) => {
    switch (status) {
      case "present":
        return "Có mặt"
      case "absent":
        return "Vắng mặt"
      case "late":
        return "Đi muộn"
      default:
        return "Chưa xác định"
    }
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

  // Loading state
  if (loading) {
    return (
      <Loading />
    )
  }

  // Error state (với fallback data)
  if (error) {
    return (
      <div className="space-y-6">
        {/* Error notification */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-orange-700 text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Calendar với dữ liệu fallback */}
        <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Lịch dạy</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hôm nay
              </Button>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-lg text-gray-600">
            {monthNames[Number.parseInt(selectedMonth) - 1]}, {selectedYear}
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">
                {day}
              </div>
            ))}

            {/* Empty days for first week */}
            {emptyDays.map((day) => (
              <div key={`empty-${day}`} className="p-2 min-h-[120px] border border-gray-200 bg-gray-50"></div>
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const daySessions = getSessionsForDay(day)
              const isCurrentDay = isToday(day)
              const hasMultipleSessions = daySessions.length > 1

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[120px] border border-gray-200 cursor-pointer transition-colors ${
                    isCurrentDay ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentDay ? "text-blue-600 bg-blue-100 px-2 py-1 rounded-full" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="flex items-center space-x-1">
                      {daySessions.some((s) => s.hasAlert) && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                      {hasMultipleSessions && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {daySessions.length}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {daySessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getSubjectColor(session.subject)}`}
                        title={`${session.title} - ${session.time} - ${session.room}`}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{session.title}</span>
                          {session.hasAlert && <AlertTriangle className="w-3 h-3 text-orange-300" />}
                        </div>
                        <div className="text-xs opacity-90 truncate">{session.time}</div>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">+{daySessions.length - 3} buổi khác</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selectedSession.title}</DialogTitle>
                  <Badge className={`${getSubjectColor(selectedSession.subject)} px-3 py-1`}>
                    {selectedSession.subject}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSession.class} - {selectedSession.room}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Ngày diễn ra:</strong> {selectedSession.date.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Thời gian bắt đầu:</strong> {selectedSession.time.split("-")[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Thời gian kết thúc:</strong> {selectedSession.time.split("-")[1]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Giáo viên phụ trách:</strong> {selectedSession.teacher}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedSession.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả buổi học:</h4>
                    <p className="text-sm text-gray-600">{selectedSession.description}</p>
                  </div>
                )}

                {/* Students */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Học viên ({selectedSession.students.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSession.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStudentStatusIcon(student.status)}
                          <span className="text-xs text-gray-600">{getStudentStatusText(student.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {selectedSession.attendanceWarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cảnh báo điểm danh
                    </h4>
                    <div className="space-y-2">
                      {selectedSession.attendanceWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-orange-700">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Vào lớp
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Vào buổi</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Danh sách buổi dạy - {monthNames[Number.parseInt(selectedMonth) - 1]} {selectedYear}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Thêm buổi dạy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có buổi dạy nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{session.date.toLocaleDateString("vi-VN")}</span>
                      </div>
                      <Badge className={`${getSubjectColor(session.subject)} px-2 py-1`}>{session.subject}</Badge>
                      <span className="text-sm font-medium">{session.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.time}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {session.room}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.hasAlert && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        <Badge
                          variant={session.status === "completed" ? "default" : "secondary"}
                          className={getStatusColor(session.status)}
                        >
                          {session.status === "completed"
                            ? "Hoàn thành"
                            : session.status === "cancelled"
                              ? "Hủy"
                              : "Đã lên lịch"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    )
  }

  // Normal state
  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900">Lịch dạy</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hôm nay
              </Button>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-lg text-gray-600">
            {monthNames[Number.parseInt(selectedMonth) - 1]}, {selectedYear}
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"].map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">
                {day}
              </div>
            ))}

            {/* Empty days for first week */}
            {emptyDays.map((day) => (
              <div key={`empty-${day}`} className="p-2 min-h-[120px] border border-gray-200 bg-gray-50"></div>
            ))}

            {/* Calendar days */}
            {days.map((day) => {
              const daySessions = getSessionsForDay(day)
              const isCurrentDay = isToday(day)
              const hasMultipleSessions = daySessions.length > 1

              return (
                <div
                  key={day}
                  className={`p-2 min-h-[120px] border border-gray-200 cursor-pointer transition-colors ${
                    isCurrentDay ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentDay ? "text-blue-600 bg-blue-100 px-2 py-1 rounded-full" : "text-gray-900"
                      }`}
                    >
                      {day}
                    </span>
                    <div className="flex items-center space-x-1">
                      {daySessions.some((s) => s.hasAlert) && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                      {hasMultipleSessions && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          {daySessions.length}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {daySessions.slice(0, 3).map((session) => (
                      <div
                        key={session.id}
                        className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getSubjectColor(session.subject)}`}
                        title={`${session.title} - ${session.time} - ${session.room}`}
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium truncate">{session.title}</span>
                          {session.hasAlert && <AlertTriangle className="w-3 h-3 text-orange-300" />}
                        </div>
                        <div className="text-xs opacity-90 truncate">{session.time}</div>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">+{daySessions.length - 3} buổi khác</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold">{selectedSession.title}</DialogTitle>
                  <Badge className={`${getSubjectColor(selectedSession.subject)} px-3 py-1`}>
                    {selectedSession.subject}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSession.class} - {selectedSession.room}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Session Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Ngày diễn ra:</strong> {selectedSession.date.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Thời gian bắt đầu:</strong> {selectedSession.time.split("-")[0]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Thời gian kết thúc:</strong> {selectedSession.time.split("-")[1]}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      <strong>Giáo viên phụ trách:</strong> {selectedSession.teacher}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {selectedSession.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Mô tả buổi học:</h4>
                    <p className="text-sm text-gray-600">{selectedSession.description}</p>
                  </div>
                )}

                {/* Students */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Học viên ({selectedSession.students.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSession.students.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={student.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{student.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStudentStatusIcon(student.status)}
                          <span className="text-xs text-gray-600">{getStudentStatusText(student.status)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warnings */}
                {selectedSession.attendanceWarnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Cảnh báo điểm danh
                    </h4>
                    <div className="space-y-2">
                      {selectedSession.attendanceWarnings.map((warning, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-orange-700">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Vào lớp
                  </Button>
                  <Button onClick={() => setIsDialogOpen(false)}>Vào buổi</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Danh sách buổi dạy - {monthNames[Number.parseInt(selectedMonth) - 1]} {selectedYear}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Thêm buổi dạy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có buổi dạy nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-white"
                  onClick={() => handleSessionClick(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium">{session.date.toLocaleDateString("vi-VN")}</span>
                      </div>
                      <Badge className={`${getSubjectColor(session.subject)} px-2 py-1`}>{session.subject}</Badge>
                      <span className="text-sm font-medium">{session.title}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="text-sm font-medium flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {session.time}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {session.room}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.hasAlert && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        <Badge
                          variant={session.status === "completed" ? "default" : "secondary"}
                          className={getStatusColor(session.status)}
                        >
                          {session.status === "completed"
                            ? "Hoàn thành"
                            : session.status === "cancelled"
                              ? "Hủy"
                              : "Đã lên lịch"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
