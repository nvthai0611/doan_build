"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Bell, Users, Calendar } from "lucide-react"
import { parentChildService } from "../../../../services"
import { useMutation, useQuery } from "@tanstack/react-query"

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  hasEvent: boolean
  sessions?: any[]
}

import type { Child } from "../../../../services/parent/child-management/child.types"

// Hàm tiện ích để format Date thành YYYY-MM-DD theo múi giờ cục bộ
const formatDateToYYYYMMDD = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

  // Map session status keys to Vietnamese labels
  const mapSessionStatus = (status?: string) => {
    switch (status) {
      case 'has_not_happened':
        return 'Chưa diễn ra'
      case 'happening':
        return 'Đang diễn ra'
      case 'end':
        return 'Đã kết thúc'
      case 'day_off':
        return 'Ngày nghỉ'
      default:
        return status || 'Không xác định'
    }
  }

  // Map attendance status to Vietnamese
  const mapAttendanceStatus = (status?: string) => {
    switch (status) {
      case 'present':
        return 'Có mặt'
      case 'absent':
        return 'Vắng'
      default:
        return status || 'Chưa điểm danh'
    }
  }

interface ChildScheduleProps {
  childId?: string
}

export function ChildSchedule({ childId }: ChildScheduleProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [attendanceBySession, setAttendanceBySession] = useState<Record<string, any>>({})
  const [attendanceLoading, setAttendanceLoading] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedChildId, setSelectedChildId] = useState<string>(childId || "")
  const [showYearPicker, setShowYearPicker] = useState(false)
  
  // Fetch children list
  const { data: children = [], isLoading: childrenLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => parentChildService.getChildren(),
    enabled: true
  })

  // Update selected child when childId prop changes
  useEffect(() => {
    if (childId && childId !== selectedChildId) {
      setSelectedChildId(childId)
    }
  }, [childId])

  // Auto select first child if none is selected
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id)
    }
  }, [children, selectedChildId])

  // Reset states when changing selected child
  useEffect(() => {
    if (selectedChildId) {
      setSessions([])
      setExpandedSessionId(null)
      setAttendanceBySession({})
      setSelectedDate(new Date())
    }
  }, [selectedChildId])

  // Đóng year picker khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (showYearPicker && !target.closest('.year-picker-container')) {
        setShowYearPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showYearPicker])
  
  if (!selectedChildId && children.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        {childrenLoading ? "Đang tải danh sách con..." : "Không có dữ liệu học sinh"}
      </div>
    )
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  // Data fetching
  const getMonthRange = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    // Ngày đầu tháng
    const start = new Date(year, month, 1)
    
    // Ngày cuối tháng
    const end = new Date(year, month + 1, 0)
    
    console.log(`Month range for ${year}-${month + 1}:`, {
      start: formatDateToYYYYMMDD(start),
      end: formatDateToYYYYMMDD(end)
    })
    
    return { start, end }
  }

  const { mutate: fetchSchedule } = useMutation<any>({
    mutationFn: async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { start, end } = getMonthRange(currentDate)
        const startDateStr = formatDateToYYYYMMDD(start)
        const endDateStr = formatDateToYYYYMMDD(end)
        
        console.log('Fetching schedule with dates:', {
          startDate: startDateStr,
          endDate: endDateStr,
          childId: selectedChildId
        })
        
        const response = await parentChildService.getChildSchedule(selectedChildId, {
          startDate: startDateStr,
          endDate: endDateStr,
        })
        return response
      } catch (err) {
        setError('Không thể tải lịch học. Vui lòng thử lại sau.')
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    onSuccess: (data: any) => {
      const sessionData = data?.data || data || []
      setSessions(Array.isArray(sessionData) ? sessionData : [])
    },
    onError: () => {
      setSessions([])
    }
  })

  useEffect(() => {
    if (selectedChildId) {
      fetchSchedule()
    }
  }, [currentDate, selectedChildId])

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: CalendarDay[] = []

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      })
    }

    // Group sessions by date (sử dụng logic nhất quán với các view khác)
    const sessionsMap = new Map<number, any[]>()
    sessions.forEach((session) => {
      // Parse date string trực tiếp để tránh timezone issues
      const sessionDateStr = session.sessionDate.split('T')[0] // Lấy YYYY-MM-DD
      const [year, month, day] = sessionDateStr.split('-').map(Number)
      
      if (
        month - 1 === currentDate.getMonth() && // month trong Date là 0-based
        year === currentDate.getFullYear()
      ) {
        const arr = sessionsMap.get(day) || []
        arr.push(session)
        sessionsMap.set(day, arr)
      }
    })

    // Current month days
    const today = new Date()
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday =
        i === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()

      const daySessions = sessionsMap.get(i) || []
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday,
        hasEvent: daySessions.length > 0,
        sessions: daySessions,
      })
    }

    return days
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // Tạo danh sách năm từ 2020 đến 2030
  const generateYears = () => {
    const years = []
    for (let year = 2003; year <= 2099; year++) {
      years.push(year)
    }
    return years
  }

  const handleYearSelect = (year: number) => {
    const newDate = new Date(year, currentDate.getMonth(), 1)
    setCurrentDate(newDate)
    setShowYearPicker(false)
  }

  const calendarDays = generateCalendarDays()
  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()
  const monthName = `Tháng ${month} ${year}`
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  
  const selectedChild = children.find(child => child.id === selectedChildId)

  return (
    <>
      <style>{`
        /* Hide scrollbar but keep scrolling */
        .year-picker-scroll {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .year-picker-scroll::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        /* Blinking dot animation */
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .blink-dot {
          animation: blink-dot 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Lịch</h1>
          <p className="text-muted-foreground mt-1">
            {selectedChild ? `Lịch học của ${selectedChild.user.fullName}` : "Lịch học của con em"}
          </p>
          {isLoading && <p className="text-sm text-muted-foreground mt-1">Đang tải...</p>}
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Child Filter */}
      {children.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Chọn con:</span>
              </div>
              <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Chọn con để xem lịch học" />
                </SelectTrigger>
                <SelectContent>
                  {children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{child.user.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {child.studentCode && `Mã học sinh: ${child.studentCode}`}
                          {child.grade && ` - Lớp: ${child.grade}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="relative year-picker-container">
                  <button
                    onClick={() => setShowYearPicker(!showYearPicker)}
                    className="flex items-center gap-2 hover:bg-accent rounded-md p-2 -m-2 transition-colors"
                  >
                    <CardTitle>{monthName}</CardTitle>
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </button>
                  <CardDescription>Lịch học tháng này</CardDescription>
                  
                  {/* Year Picker Dropdown */}
                  {showYearPicker && (
                    <div
                      role="dialog"
                      aria-label="Chọn năm"
                      className="absolute top-full left-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-2 min-w-[200px] max-h-[240px] overflow-auto year-picker-scroll"
                    >
                      <div className="grid grid-cols-3 gap-2 p-2">
                        {generateYears().map((year) => (
                          <button
                            key={year}
                            onClick={() => handleYearSelect(year)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              year === currentDate.getFullYear()
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent text-foreground'
                            }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleToday}
                    className="ml-2"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Hôm nay
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-semibold text-xs text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const isSelected = selectedDate && day.date > 0 && selectedDate.getDate() === day.date && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear()
                  
                  // Xác định màu dấu chấm dựa trên trạng thái buổi học
                  let dotColor = 'bg-blue-400' // Mặc định: xanh dương nhạt (chưa diễn ra)
                  if (day.hasEvent && day.sessions && day.sessions.length > 0) {
                    const firstSession = day.sessions[0]
                    switch (firstSession.status) {
                      case 'has_not_happened':
                        dotColor = 'bg-blue-400' // Xanh dương nhạt
                        break
                      case 'happening':
                        dotColor = 'bg-green-500' // Xanh lá
                        break
                      case 'end':
                        dotColor = 'bg-red-400' // Đỏ nhạt
                        break
                      case 'day_off':
                        dotColor = 'bg-orange-400' // Cam nhạt
                        break
                    }
                  }
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day.date > 0) {
                          setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date))
                          setExpandedSessionId(null)
                        }
                      }}
                      className={`
                        h-10 flex items-center justify-center rounded-md text-xs font-medium relative focus:outline-none
                        ${
                          day.isCurrentMonth
                            ? "bg-card border border-border hover:bg-accent cursor-pointer"
                            : day.date === 0
                              ? "bg-transparent"
                              : "text-muted-foreground bg-muted/30"
                        }
                        ${day.hasEvent && day.isCurrentMonth && !day.isToday ? "bg-blue-50 dark:bg-blue-900/10 border-blue-300 dark:border-blue-700 font-semibold" : ""}
                        ${day.isToday ? "bg-primary text-primary-foreground" : ""}
                        ${isSelected ? "ring-2 ring-offset-1 ring-primary" : ""}
                      `}
                    >
                      {day.date > 0 && <span className="leading-none">{day.date}</span>}
                      {day.hasEvent && day.isCurrentMonth && !day.isToday && (
                        <div className={`absolute bottom-1 w-1.5 h-1.5 ${dotColor} rounded-full blink-dot`}></div>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Classes Today */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buổi học</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                (() => {
                  const sel = selectedDate
                  const selectedSessions = sessions.filter((session) => {
                    // Parse date string trực tiếp để tránh timezone issues
                    const sessionDateStr = session.sessionDate.split('T')[0] // Lấy YYYY-MM-DD
                    const [year, month, day] = sessionDateStr.split('-').map(Number)
                    return day === sel.getDate() && month - 1 === sel.getMonth() && year === sel.getFullYear()
                  })
                  if (selectedSessions.length === 0) {
                    return (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Hôm nay không có buổi học nào diễn ra</p>
                      </div>
                    )
                  }
                  return (
                    <div className="space-y-3">
                      {selectedSessions.map((session) => (
                        <div key={session.id} className="border rounded-md p-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{session.class?.name || session.class?.subject?.name}</p>
                              <p className="text-sm text-muted-foreground">{session.startTime} - {session.endTime}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-muted-foreground">{session.room?.name}</div>
                              <button
                                className="text-sm text-primary underline"
                                onClick={async () => {
                                  const next = expandedSessionId === session.id ? null : session.id
                                  setExpandedSessionId(next)
                                  if (next && !attendanceBySession[session.id]) {
                                    // fetch attendance for this session (by date + classId)
                                    try {
                                      setAttendanceLoading((s) => ({ ...s, [session.id]: true }))
                                      const iso = new Date(session.sessionDate).toISOString().slice(0, 10)
                                      const records: any[] = await parentChildService.getChildAttendance(selectedChildId, session.classId || session.class?.id, iso, iso)
                                      // find the record for this session id
                                      const rec = (records || []).find(r => r.sessionId === session.id) || (records && records[0]) || null
                                      setAttendanceBySession((s) => ({ ...s, [session.id]: rec }))
                                    } catch (e) {
                                      setAttendanceBySession((s) => ({ ...s, [session.id]: { error: true } }))
                                    } finally {
                                      setAttendanceLoading((s) => ({ ...s, [session.id]: false }))
                                    }
                                  }
                                }}
                                aria-expanded={expandedSessionId === session.id}
                              >
                                {expandedSessionId === session.id ? 'Ẩn' : 'Chi tiết'}
                              </button>
                            </div>
                          </div>
                          {expandedSessionId === session.id && (
                            <div className="mt-3 text-sm text-muted-foreground space-y-2">
                              <div><strong>Lớp:</strong> {session.class?.name}</div>
                              <div><strong>Môn:</strong> {session.class?.subject?.name}</div>
                              <div><strong>Giáo viên:</strong> {session.class?.teacher?.fullName || session.class?.teacher?.user?.fullName}</div>
                              <div><strong>Phòng:</strong> {session.room?.name}</div>
                              <div className="flex items-center gap-2">
                                <strong>Trạng thái:</strong>
                                <Badge 
                                  className={
                                    session.status === 'has_not_happened' ? 'bg-blue-400 hover:bg-blue-500' :
                                    session.status === 'happening' ? 'bg-green-500 hover:bg-green-600' :
                                    session.status === 'end' ? 'bg-red-400 hover:bg-red-500' :
                                    session.status === 'day_off' ? 'bg-orange-400 hover:bg-orange-500' :
                                    'bg-gray-400 hover:bg-gray-500'
                                  }
                                >
                                  {mapSessionStatus(session.status)}
                                </Badge>
                              </div>
                              <div className="pt-2 border-t">
                                <strong>Điểm danh</strong>
                                {attendanceLoading[session.id] ? (
                                  <div className="text-sm text-muted-foreground">Đang tải điểm danh...</div>
                                ) : attendanceBySession[session.id]?.error ? (
                                  <div className="text-sm text-destructive">Không thể tải điểm danh</div>
                                ) : attendanceBySession[session.id] ? (
                                  <div className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <strong>Trạng thái:</strong>
                                      <Badge 
                                        className={
                                          attendanceBySession[session.id].attendanceStatus === 'present' 
                                            ? 'bg-green-500 hover:bg-green-600' 
                                            : attendanceBySession[session.id].attendanceStatus === 'absent'
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-gray-400 hover:bg-gray-500'
                                        }
                                      >
                                        {mapAttendanceStatus(attendanceBySession[session.id].attendanceStatus)}
                                      </Badge>
                                    </div>
                                    {attendanceBySession[session.id].attendanceRecordedAt && (
                                      <div><strong>Ghi nhận lúc:</strong> {new Date(attendanceBySession[session.id].attendanceRecordedAt).toLocaleString('vi-VN')}</div>
                                    )}
                                    {attendanceBySession[session.id].attendanceRecordedBy && (
                                      <div><strong>Người ghi:</strong> {attendanceBySession[session.id].attendanceRecordedBy}</div>
                                    )}
                                    {attendanceBySession[session.id].attendanceNote && (
                                      <div><strong>Ghi chú:</strong> {attendanceBySession[session.id].attendanceNote}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">Chưa có thông tin điểm danh</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Chọn một ngày để xem buổi học</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignments */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bài tập</CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.some(session => {
                const sessionDate = new Date(session.sessionDate)
                const today = new Date()
                return (
                  sessionDate.getDate() === today.getDate() &&
                  sessionDate.getMonth() === today.getMonth() &&
                  sessionDate.getFullYear() === today.getFullYear() &&
                  session.assignments?.length > 0
                )
              }) ? (
                <div className="space-y-4">
                  {sessions
                    .filter(session => {
                      const sessionDate = new Date(session.sessionDate)
                      const today = new Date()
                      return (
                        sessionDate.getDate() === today.getDate() &&
                        sessionDate.getMonth() === today.getMonth() &&
                        sessionDate.getFullYear() === today.getFullYear() &&
                        session.assignments?.length > 0
                      )
                    })
                    .map((session) => (
                      session.assignments?.map((assignment: any) => (
                        <div key={assignment.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.class?.name || session.class?.subject?.name}
                            </p>
                          </div>
                          {assignment.dueDate && (
                            <div className="text-sm text-muted-foreground">
                              Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                            </div>
                          )}
                        </div>
                      ))
                    ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">Hôm nay không có bài tập nào</p>
                </div>
              )}
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
    </>
  )
}
