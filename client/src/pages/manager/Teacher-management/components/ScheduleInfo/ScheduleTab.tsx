"use client"

import React, { useState } from "react"
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
import Loading from "../../../../../components/Loading/LoadingPage"

// Import từ các file đã tách
import { ScheduleTabProps, TeachingSession } from "./types"
import { ViewType, MONTH_NAMES, DAY_NAMES } from "./enums"
import { 
  getDaysInMonth, 
  getFirstDayOfMonth, 
  isToday, 
  getSessionsForDay, 
  getSubjectColor, 
  getStatusColor, 
  getStudentStatusText,
  navigateMonth,
  navigateWeek,
  navigateDay,
  goToToday,
  getWeekDates,
  getSessionsForWeek,
  getSessionsForTimeSlot,
  formatWeekRange,
  getWeekContainingToday
} from "./utils"
import { useTeachingSessions } from "./hooks"




export default function ScheduleTab({
  teacherId,
  currentDate,
  selectedMonth,
  selectedYear,
  setCurrentDate,
  setSelectedMonth,
  setSelectedYear,
}: ScheduleTabProps) {
  const [selectedSession, setSelectedSession] = useState<TeachingSession | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewType, setViewType] = useState<ViewType>("month")
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date())

  // Handle view type change
  const handleViewTypeChange = (newViewType: ViewType) => {
    setViewType(newViewType)
    
    // Khi chuyển sang chế độ tuần, hiển thị tuần có ngày hôm nay
    if (newViewType === "week") {
      setCurrentWeekDate(new Date())
    }
  }
  
  const { sessions, loading, error } = useTeachingSessions(
    teacherId, 
    Number.parseInt(selectedYear), 
    Number.parseInt(selectedMonth) 
  )

  const daysInMonth = getDaysInMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  const firstDay = getFirstDayOfMonth(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i)

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

  // Navigation function based on view type
  const handleNavigation = (direction: "prev" | "next") => {
    switch (viewType) {
      case "month":
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      case "week":
        // Navigation cho tuần sử dụng currentWeekDate
        const newWeekDate = new Date(currentWeekDate)
        if (direction === "prev") {
          newWeekDate.setDate(newWeekDate.getDate() - 7)
        } else {
          newWeekDate.setDate(newWeekDate.getDate() + 7)
        }
        setCurrentWeekDate(newWeekDate)
        setSelectedMonth((newWeekDate.getMonth() + 1).toString())
        setSelectedYear(newWeekDate.getFullYear().toString())
        break
      case "day":
        navigateDay(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      case "list":
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
        break
      default:
        navigateMonth(direction, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear)
    }
  }

  // Get display info based on view type
  const getDisplayInfo = () => {
    switch (viewType) {
      case "month":
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
      case "week":
        // Tạo tuần dựa trên currentWeekDate
        const startOfWeek = new Date(currentWeekDate)
        startOfWeek.setDate(currentWeekDate.getDate() - currentWeekDate.getDay())
        
        const weekDates: Date[] = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(startOfWeek)
          date.setDate(startOfWeek.getDate() + i)
          weekDates.push(date)
        }
        return formatWeekRange(weekDates)
      case "day":
        const currentDate = new Date(Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1, 1);
        return currentDate.toLocaleDateString("vi-VN", { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case "list":
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
      default:
        return `${MONTH_NAMES[Number.parseInt(selectedMonth) - 1]}, ${selectedYear}`
    }
  }

  // Render different views based on viewType
  const renderView = () => {
    switch (viewType) {
      case "month":
        return renderMonthView()
      case "week":
        return renderWeekView()
      case "day":
        return renderDayView()
      case "list":
        return renderListView()
      default:
        return renderMonthView()
    }
  }

  // Month view (existing calendar)
  const renderMonthView = () => (
    <Card>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {DAY_NAMES.map((day) => (
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
            const daySessions = getSessionsForDay(sessions, day, Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
            const isCurrentDay = isToday(day, Number.parseInt(selectedYear), Number.parseInt(selectedMonth) - 1)
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
  )

  // Week view
  const renderWeekView = () => {
    // Tạo tuần dựa trên currentWeekDate
    const startOfWeek = new Date(currentWeekDate)
    startOfWeek.setDate(currentWeekDate.getDate() - currentWeekDate.getDay())
    
    const weekDates: Date[] = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      weekDates.push(date)
    }
    
    const weekSessions = getSessionsForWeek(sessions, weekDates)
    const timeSlots = Array.from({ length: 24 }, (_, i) => i) // 0-23 hours

    return (
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          {/* Time column header */}
          <div className="bg-gray-50 p-2 border-r border-b">
            <div className="text-xs font-medium text-gray-500 text-center">Giờ</div>
          </div>
          
          {/* Day headers */}
          {weekDates.map((date, index) => (
            <div key={index} className="bg-gray-50 p-2 border-b">
              <div className="text-xs font-medium text-gray-500 text-center">
                {DAY_NAMES[date.getDay()]}
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {date.getDate()}
              </div>
            </div>
          ))}

          {/* Time slots and sessions */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time slot label */}
              <div className="bg-gray-50 p-2 border-r border-b text-xs text-gray-500 text-center">
                {hour.toString().padStart(2, '0')} giờ
              </div>
              
              {/* Day columns for this hour */}
              {weekDates.map((date, dayIndex) => {
                const hourSessions = getSessionsForTimeSlot(weekSessions, date, hour)
                
                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className="min-h-[60px] border-b border-r bg-white hover:bg-gray-50 transition-colors relative"
                  >
                    {hourSessions.map((session, sessionIndex) => (
                      <div
                        key={session.id}
                        className={`absolute inset-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity ${getSubjectColor(session.subject)}`}
                        title={`${session.title} - ${session.time} - ${session.room}`}
                        onClick={() => handleSessionClick(session)}
                        style={{
                          top: `${sessionIndex * 20}px`,
                          height: '36px',
                          fontSize: '12px'
                        }}
                      >
                        <div className="truncate font-medium">{session.title}</div>
                        <div className="truncate opacity-90">{session.time}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  // Day view
  const renderDayView = () => (
    <Card>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-500">Mai rồi tao làm</p>
        </div>
      </CardContent>
    </Card>
  )

  // List view (existing sessions list)
  const renderListView = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Danh sách buổi dạy - {MONTH_NAMES[Number.parseInt(selectedMonth) - 1]} {selectedYear}
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
  )

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
              <Select value={viewType} onValueChange={handleViewTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToToday(setSelectedMonth, setSelectedYear, setCurrentDate)}>
                Hôm nay
              </Button>
            </div>
          </div>

        </CardHeader>
        <CardContent>
          {renderView()}
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
              <Select value={viewType} onValueChange={handleViewTypeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="day">Ngày</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleNavigation("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => goToToday(setSelectedMonth, setSelectedYear, setCurrentDate)}>
                Hôm nay
              </Button>
              {/* <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>
          </div>
          <div className="text-lg text-gray-600">
            {getDisplayInfo()}
          </div>
        </CardHeader>
        <CardContent>
          {renderView()}
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

    </div>
  )
}
