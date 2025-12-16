"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type ViewType = "month" | "week" | "list"

const MONTH_NAMES = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"
] as const

const DAY_NAMES = [
  "Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"
] as const

export default function StudentSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState<ViewType>("month")
  const [schedules, setSchedules] = useState<StudentScheduleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)
        setError(null)

        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const weekStart = currentDate
          .toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
          .split('/')
          .reverse()
          .join('-')

        const type = viewType === "month" ? "monthly" : viewType === "week" ? "weekly" : "list"
        let rawData: unknown[] = []
        
        if (type === "monthly") {
          rawData = await studentScheduleService.getMonthlySchedule(year, month)
        } else if (type === "weekly") {
          rawData = await studentScheduleService.getWeeklySchedule(weekStart)
        } else {
          // list: tái sử dụng monthly giống trang teacher
          rawData = await studentScheduleService.getMonthlySchedule(year, month)
        }

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
  }, [currentDate, viewType])

  const getDateKey = (d: Date) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, StudentScheduleItem[]>()
    for (const s of schedules) {
      const dateStr = s.date.toString().split('T')[0]
      const list = map.get(dateStr) || []
      list.push(s)
      map.set(dateStr, list)
    }
    return map
  }, [schedules])

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

  const handlePrev = () => {
    if(viewType === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if(viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      setCurrentDate(new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }
  const handleNext = () => {
    if(viewType === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if(viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      setCurrentDate(new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }
  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const daysInMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate(), [currentDate])
  const firstDay = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(), [currentDate])
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])
  const emptyDays = useMemo(() => Array.from({ length: firstDay }, (_, i) => i), [firstDay])

  const renderMonthView = () => (
    <Card className="border">
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-xs md:text-sm">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="p-2 text-center font-medium text-gray-600 bg-gray-50"
            >
              {d}
            </div>
          ))}

          {emptyDays.map((d) => (
            <div
              key={`e-${d}`}
              className="p-2 min-h-[80px] border border-gray-200 bg-gray-50"
            />
          ))}

          {days.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateKey = getDateKey(date)
            const dayList = schedulesByDate.get(dateKey) ?? []
            const isToday = new Date().toDateString() === date.toDateString()

            return (
              <div
                key={day}
                className={`p-2 min-h-[80px] border border-gray-200 ${
                  isToday ? "bg-gray-100" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{day}</span>
                  {dayList.length > 0 && (
                    <span className="text-[10px] text-gray-500">
                      {dayList.length} buổi
                    </span>
                  )}
                </div>

                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {dayList.slice(0, 2).map((s) => (
                    <div
                      key={s.id}
                      className={`text-xs p-2 rounded ${getClassSessionStatusColor(
                        s.status,
                        s.attendanceStatus,
                      )}`}
                    >
                      <div className="font-medium truncate">{s.className}</div>
                      <div className="text-[11px] text-gray-600 truncate">
                        {s.startTime}-{s.endTime}
                      </div>
                      <div className="text-[11px] text-gray-600 truncate">
                        Phòng: {s.room || "Chưa phân phòng"}
                      </div>
                      <div className="mt-1">
                        {getAttendanceBadge(s.status, s.attendanceStatus)}
                      </div>
                    </div>
                  ))}
                  {dayList.length > 2 && (
                    <div className="text-[11px] text-gray-500 text-center py-1 bg-gray-100 rounded">
                      +{dayList.length - 2} buổi khác
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )

  const getWeekRange = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    return { startOfWeek, endOfWeek }
  }

  const renderWeekView = () => {
    const { startOfWeek } = getWeekRange()
    const weekDates: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
    const timeSlots = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="border rounded-lg overflow-x-auto">
        <div className="grid grid-cols-8 gap-0">
          <div className="bg-gray-50 p-2 border-r border-b">
            <div className="text-xs font-medium text-gray-500 text-center">Giờ</div>
          </div>
          {weekDates.map((date, idx) => (
            <div key={idx} className="bg-gray-50 p-2 border-b">
              <div className="text-xs font-medium text-gray-600 text-center">
                {DAY_NAMES[date.getDay()]}
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">
                {date.getDate()}
              </div>
            </div>
          ))}

          {timeSlots.map((hour) => (
            <>
              <div
                key={`h-${hour}`}
                className="bg-gray-50 p-2 border-r border-b text-xs text-gray-500 text-center"
              >
                {String(hour).padStart(2, "0")} giờ
              </div>
              {weekDates.map((date, dayIdx) => {
                const dateKey = getDateKey(date)
                const list = (schedulesByDate.get(dateKey) ?? []).filter(s => parseInt(s.startTime.split(":")[0]) === hour)
                return (
                  <div
                    key={`${hour}-${dayIdx}`}
                    className="min-h-[60px] border-b border-r bg-white"
                  >
                    {list.map((s, si) => (
                      <div
                        key={s.id}
                        className={`absolute inset-1 rounded text-xs p-1 ${getClassSessionStatusColor(
                          s.status,
                          s.attendanceStatus,
                        )}`}
                        style={{ top: `${si * 20}px`, height: '58px', fontSize: '10px' }}
                      >
                        <div className="truncate font-medium">
                          {s.className} - {s.room || "Chưa phân phòng"}
                        </div>
                        <div className="truncate text-gray-700">
                          {s.startTime}-{s.endTime}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>
    )
  }

  const renderListView = () => {
    const monthKeyPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`
    const list = schedules.filter(s => s.date.toString().startsWith(monthKeyPrefix))
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">
            Danh sách buổi học - {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="text-center py-6 text-sm text-gray-600">
              Không có buổi học nào trong tháng này
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((s) => (
                <div
                  key={s.id}
                  className="border rounded p-3 md:p-4 bg-white"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(s.date).toLocaleDateString("vi-VN")} • {s.className}
                      </div>
                      <div className="text-sm text-gray-700">
                        Môn học: {s.subject}
                      </div>
                      <div className="text-sm text-gray-700">
                        Thời gian: {s.startTime}-{s.endTime}
                      </div>
                      <div className="text-sm text-gray-700">
                        Phòng: {s.room || "Chưa phân phòng"}
                      </div>
                      {s.teacher && (
                        <div className="text-sm text-gray-700">
                          Giáo viên: {s.teacher.fullName}
                        </div>
                      )}
                      {s.attendanceRecordedBy && (
                        <div className="text-xs text-gray-600">
                          Điểm danh bởi:{" "}
                          <span className="font-medium">
                            {s.attendanceRecordedBy.fullName}
                          </span>
                        </div>
                      )}
                      {s.attendanceNote && (
                        <div className="text-xs text-gray-700">
                          Ghi chú: {s.attendanceNote}
                        </div>
                      )}
                    </div>
                    <div className="md:ml-4">
                      {getAttendanceBadge(s.status, s.attendanceStatus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-4">
      <Card className="border">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle className="text-lg md:text-2xl font-bold text-gray-900">
                Lịch học
              </CardTitle>
              <p className="text-sm text-gray-600">
                Xem lịch học và trạng thái điểm danh.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={viewType}
                onValueChange={(v: ViewType) => setViewType(v)}
              >
                <SelectTrigger className="w-28 md:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Tháng</SelectItem>
                  <SelectItem value="week">Tuần</SelectItem>
                  <SelectItem value="list">Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrev}
                className="text-xs md:text-sm"
              >
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="text-xs md:text-sm"
              >
                Sau
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs md:text-sm"
              >
                Hôm nay
              </Button>
            </div>
          </div>
          {viewType === "month" && (
            <div className="mt-2 text-sm text-gray-700">
              Tháng {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          )}
          {viewType === "week" && (
            <div className="mt-2 text-sm text-gray-700">
              Tuần{" "}
              {getWeekRange().startOfWeek.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
              {" - "}
              {getWeekRange().endOfWeek.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
          )}
          {viewType === "list" && (
            <div className="mt-2 text-sm text-gray-700">
              Tháng {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-3 text-sm text-red-700">{error}</div>
          ) : null}
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "list" && renderListView()}
        </CardContent>
      </Card>
    </div>
  )
}