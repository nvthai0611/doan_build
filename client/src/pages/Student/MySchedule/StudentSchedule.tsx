"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Loading from "../../../components/Loading/LoadingPage"
import { studentScheduleService } from "../../../services/student/schedule/schedule.service"

// Kiểu dữ liệu hiển thị trên UI cho student
interface StudentScheduleItem {
  id: string
  date: string
  startTime: string
  endTime: string
  subject: string
  className: string
  room?: string
  status?: string // Status của session: has_not_happened, happening, end, cancelled, day_off
  notes?: string // Ghi chú của session
  attendanceStatus?: "present" | "absent" | "late" | "excused" | null
  attendanceNote?: string | null
  attendanceRecordedAt?: string | null
  attendanceRecordedBy?: {
    id: string
    fullName: string
  } | null
  teacher?: {
    fullName: string
    email?: string
    phone?: string
  }
}

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  hasEvent: boolean
  sessions?: StudentScheduleItem[]
}

export default function StudentSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<StudentScheduleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)

        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        let rawData: unknown[] = []
        rawData = await studentScheduleService.getMonthlySchedule(year, month)

        // Map dữ liệu từ API mới về dạng dùng cho UI
        const items: StudentScheduleItem[] = (rawData || []).map((session: unknown) => {
          const s = session as Record<string, unknown>
          const classData = s.class as Record<string, unknown>
          const subjectData = classData?.subject as Record<string, unknown>
          const teacherData = classData?.teacher as Record<string, unknown>
          const teacherUser = teacherData?.user as Record<string, unknown>
          const roomData = s.room as Record<string, unknown>
          
          return {
            id: s.id as string,
            date: s.sessionDate as string,
            startTime: s.startTime as string,
            endTime: s.endTime as string,
            subject: subjectData?.name as string || "",
            className: classData?.name as string || "",
            room: roomData?.name as string || undefined,
            status: s.status as string || undefined, // Status của session
            notes: s.notes as string || undefined, // Ghi chú của session
            attendanceStatus: s.attendanceStatus as "present" | "absent" | "late" | "excused" | null,
            attendanceNote: s.attendanceNote as string | null,
            attendanceRecordedAt: s.attendanceRecordedAt as string | null,
            attendanceRecordedBy: s.attendanceRecordedBy as { id: string; fullName: string } | null,
            teacher: teacherUser ? {
              fullName: teacherUser.fullName as string,
              email: teacherUser.email as string,
              phone: teacherUser.phone as string
            } : undefined,
          }
        })

        setSchedules(items)
      } catch (e) {
        console.error('Error fetching schedules:', e)
        setError("Không thể tải dữ liệu từ server")
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }

    fetchSchedules()
  }, [currentDate])

  const getDateKey = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const getClassSessionStatusColor = (status?: string, attendanceStatus?: string | null) => {
    // 1) day_off & cancelled luôn nền vàng nhạt
    if (status === 'day_off' || status === 'cancelled') {
      return 'bg-yellow-50 border border-yellow-300 text-yellow-900';
    }

    // 2) Màu theo trạng thái điểm danh
    if (attendanceStatus === 'present') {
      // Có mặt – nền xanh lá nhạt
      return 'bg-green-50 border border-green-300 text-green-800';
    }

    if (attendanceStatus === 'absent') {
      // Vắng mặt – nền đỏ nhạt
      return 'bg-red-50 border border-red-300 text-red-800';
    }

    if (attendanceStatus == null) {
      // Chưa điểm danh – nền xanh dương nhạt
      return 'bg-blue-50 border border-blue-300 text-blue-800';
    }

    // Các trạng thái điểm danh khác (late, excused, ...) dùng xám nhạt
    return 'bg-gray-50 border border-gray-300 text-gray-800';
  }

  const getAttendanceBadge = (sessionStatus?: string, attendanceStatus?: string | null) => {
    // Nếu buổi là ngày nghỉ hoặc đã huỷ, ưu tiên hiển thị theo buổi, không nói "Chưa điểm danh"
    if (sessionStatus === 'day_off') {
      return <span className="text-xs text-yellow-800">Ngày nghỉ</span>
    }
    if (sessionStatus === 'cancelled') {
      return <span className="text-xs text-yellow-800">Buổi học bị huỷ</span>
    }

    // Còn lại hiển thị theo trạng thái điểm danh
    switch (attendanceStatus) {
      case 'present':
        return <span className="text-xs text-green-800">Có mặt</span>
      case 'absent':
        return <span className="text-xs text-red-800">Vắng mặt</span>
      case 'late':
        return <span className="text-xs text-orange-800">Đi muộn</span>
      case 'excused':
        return <span className="text-xs text-blue-800">Có phép</span>
      case null:
      case undefined:
      default:
        return <span className="text-xs text-blue-800">Chưa điểm danh</span>
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: CalendarDay[] = []

    // Các ô trống trước ngày 1
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: 0,
        isCurrentMonth: false,
        isToday: false,
        hasEvent: false,
      })
    }

    // Group schedules theo ngày trong tháng hiện tại
    const sessionsMap = new Map<number, StudentScheduleItem[]>()
    schedules.forEach((s) => {
      const dateStr = s.date.toString().split("T")[0] // YYYY-MM-DD
      const [year, month, day] = dateStr.split("-").map(Number)

      if (
        month - 1 === currentDate.getMonth() &&
        year === currentDate.getFullYear()
      ) {
        const arr = sessionsMap.get(day) || []
        arr.push(s)
        sessionsMap.set(day, arr)
      }
    })

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

  if (loading) return <Loading />

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch học</h1>
          <p className="text-sm text-gray-600">
            Xem lịch học và trạng thái điểm danh của bạn.
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
      </div>

      {/* Main content: calendar + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar (trái) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Tháng {currentDate.getMonth() + 1} {currentDate.getFullYear()}
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    Trước
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Sau
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleToday}>
                    Hôm nay
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Header thứ trong tuần */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-xs text-gray-600 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Lưới ngày */}
              <div className="grid grid-cols-7 gap-2">
                {generateCalendarDays().map((day, index) => {
                  const isSelected =
                    selectedDate &&
                    day.date > 0 &&
                    selectedDate.getDate() === day.date &&
                    selectedDate.getMonth() === currentDate.getMonth() &&
                    selectedDate.getFullYear() === currentDate.getFullYear()

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (day.date > 0) {
                          setSelectedDate(
                            new Date(
                              currentDate.getFullYear(),
                              currentDate.getMonth(),
                              day.date,
                            ),
                          )
                        }
                      }}
                      className={`
                        h-10 flex items-center justify-center rounded-md text-xs font-medium relative
                        ${
                          day.isCurrentMonth
                            ? "bg-white border border-gray-200 hover:bg-gray-50"
                            : "bg-transparent"
                        }
                        ${day.isToday ? "border-gray-800" : ""}
                        ${isSelected ? "ring-2 ring-offset-1 ring-gray-800" : ""}
                      `}
                    >
                      {day.date > 0 && <span>{day.date}</span>}
                      {day.hasEvent && day.isCurrentMonth && !day.isToday && (
                        <span className="absolute bottom-1 w-1.5 h-1.5 bg-gray-600 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar phải: buổi học trong ngày */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buổi học</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                (() => {
                  const sel = selectedDate
                  const dayKey = getDateKey(sel)
                  const selectedSessions = schedules.filter((s) =>
                    s.date.toString().startsWith(dayKey),
                  )

                  if (selectedSessions.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm text-gray-600">
                        Không có buổi học nào trong ngày này
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-3">
                      {selectedSessions.map((s) => (
                        <div
                          key={s.id}
                          className={`border rounded-md p-3 ${getClassSessionStatusColor(
                            s.status,
                            s.attendanceStatus,
                          )}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">
                                {s.className}
                              </p>
                              <p className="text-xs text-gray-700">
                                {s.startTime} - {s.endTime}
                              </p>
                              <p className="text-xs text-gray-700">
                                Phòng: {s.room || "Chưa phân phòng"}
                              </p>
                            </div>
                            <div className="text-right">
                              {getAttendanceBadge(s.status, s.attendanceStatus)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })()
              ) : (
                <div className="text-center py-6 text-sm text-gray-600">
                  Chọn một ngày để xem buổi học
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}