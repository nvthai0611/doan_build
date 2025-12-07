"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, UserCheck, BookOpen, Users, GraduationCap } from "lucide-react"
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

  const getClassSessionStatusColor = (status?: string) => {
    if (!status) return 'bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 text-blue-800 shadow-sm'
    switch (status) {
      case "day_off": return 'bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 text-orange-800 shadow-sm'
      case "happening": return 'bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-300 text-green-800 shadow-sm'
      case "end": return 'bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 text-red-800 shadow-sm'
      case "has_not_happened": return 'bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-300 text-blue-800 shadow-sm'
      case "cancelled": return "bg-gradient-to-br from-red-100 to-red-50 border-2 border-red-300 text-red-800 shadow-sm"
      default: return 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-400 text-yellow-900 shadow-sm'
    }
  }

  const getAttendanceBadge = (status?: string | null) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          Có mặt
        </Badge>
      case 'absent':
        return <Badge className="bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Vắng mặt
        </Badge>
      case 'late':
        return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Đi muộn
        </Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          Có phép
        </Badge>
      case null:
      case undefined:
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          Chưa điểm danh
        </Badge>
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
    <Card>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((d) => (
            <div key={d} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-t-lg">{d}</div>
          ))}

          {emptyDays.map((d) => (
            <div key={`e-${d}`} className="p-2 min-h-[120px] border border-gray-200 bg-gray-50"></div>
          ))}

          {days.map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dateKey = getDateKey(date)
            const dayList = schedulesByDate.get(dateKey) ?? []
            const isToday = new Date().toDateString() === date.toDateString()
            const hasMultiple = dayList.length > 1

            return (
              <div key={day} className={`p-2 min-h-[120px] border border-gray-200 ${isToday ? "bg-blue-50 border-blue-300" : "bg-white hover:bg-gray-50"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isToday ? "text-blue-600 bg-blue-100 px-2 py-1 rounded-full" : "text-gray-900"}`}>{day}</span>
                  <div className="flex items-center space-x-1">
                    {hasMultiple && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">{dayList.length}</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1 max-h-28 overflow-y-auto">
                  {dayList.slice(0, 2).map((s) => (
                    <div 
                      key={s.id} 
                      className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${getClassSessionStatusColor(s.status)}`}
                      title={`${s.subject} - ${s.className} - ${s.room || ''}${s.teacher ? ` - GV: ${s.teacher.fullName}` : ''}${s.notes ? ` - Ghi chú: ${s.notes}` : ''}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium truncate flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {s.className}
                        </span>
                      </div>
                      <div className="text-xs opacity-90 truncate flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" />
                        {s.startTime}-{s.endTime}
                      </div>
                      <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                        <span className="inline-flex items-center gap-1 truncate flex-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{s.room || 'Chưa phân phòng'}</span>
                        </span>
                      </div>
                      {/* Hiển thị status text như teacher */}
                      {s.status === 'day_off' ? (
                        <span style={{ fontSize: '10px' }}>(Nghỉ)</span>
                      ) : s.status === 'end' ? (
                        <span style={{ fontSize: '10px' }}>(Đã kết thúc)</span>
                      ) : s.status === 'cancelled' ? (
                        <span style={{ fontSize: '10px' }}>(Đã hủy)</span>
                      ) : null}
                      <div className="mt-1 flex justify-center">
                        {getAttendanceBadge(s.attendanceStatus)}
                      </div>
                    </div>
                  ))}
                  {dayList.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1 bg-gray-100 rounded">+{dayList.length - 2} buổi khác</div>
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
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-8 gap-0">
          <div className="bg-gray-50 p-2 border-r border-b">
            <div className="text-xs font-medium text-gray-500 text-center">Giờ</div>
          </div>
          {weekDates.map((date, idx) => (
            <div key={idx} className="bg-gray-50 p-2 border-b">
              <div className="text-xs font-medium text-gray-500 text-center">{DAY_NAMES[date.getDay()]}</div>
              <div className="text-sm font-semibold text-gray-900 text-center">{date.getDate()}</div>
            </div>
          ))}

          {timeSlots.map((hour) => (
            <>
              <div key={`h-${hour}`} className="bg-gray-50 p-2 border-r border-b text-xs text-gray-500 text-center">{String(hour).padStart(2,'0')} giờ</div>
              {weekDates.map((date, dayIdx) => {
                const dateKey = getDateKey(date)
                const list = (schedulesByDate.get(dateKey) ?? []).filter(s => parseInt(s.startTime.split(":")[0]) === hour)
                return (
                  <div key={`${hour}-${dayIdx}`} className="min-h-[60px] border-b border-r bg-white hover:bg-gray-50 transition-colors relative">
                    {list.map((s, si) => (
                      <div 
                        key={s.id} 
                        className={`absolute inset-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 transition-opacity ${getClassSessionStatusColor(s.status)}`}
                        title={`${s.subject} - ${s.className} - ${s.room || ''}${s.teacher ? ` - GV: ${s.teacher.fullName}` : ''}${s.notes ? ` - Ghi chú: ${s.notes}` : ''}`}
                        style={{ top: `${si * 20}px`, height: '58px', fontSize: '10px' }}
                      >
                        <div className="truncate font-medium">{s.className} - {s.room || 'Chưa phân phòng'}</div>
                        <div className="truncate opacity-90">{s.startTime}-{s.endTime}</div>
                        {s.status === "day_off" ? (
                          <span style={{ fontSize: '10px' }}>(Nghỉ)</span>
                        ) : s.status === "end" ? (
                          <span style={{ fontSize: '10px' }}>(Đã kết thúc)</span>
                        ) : s.status === "cancelled" ? (
                          <span style={{ fontSize: '10px' }}>(Đã hủy)</span>
                        ) : null}
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Danh sách buổi học - {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có buổi học nào trong tháng này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((s) => (
                <div key={s.id} className="border rounded-xl p-5 hover:shadow-lg transition-all bg-white border-l-4 border-l-blue-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                          <CalendarDays className="w-4 h-4 text-blue-700" />
                          <span className="text-sm font-semibold text-blue-900">{new Date(s.date).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <Badge className="px-3 py-1 bg-blue-700 text-white flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          {s.subject}
                        </Badge>
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-full">
                          <BookOpen className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-800">{s.className}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.startTime}-{s.endTime}</div>
                            <div className="text-xs text-gray-500">Thời gian</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-700" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{s.room || 'Chưa phân phòng'}</div>
                            <div className="text-xs text-gray-500">Phòng học</div>
                          </div>
                        </div>
                        
                        {s.teacher && (
                          <div className="flex items-center space-x-2">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{s.teacher.fullName}</div>
                              <div className="text-xs text-gray-500">Giáo viên</div>
                            </div>
                    </div>
                        )}
                      </div>
                      
                      {s.attendanceRecordedBy && (
                        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600">Điểm danh bởi: <span className="font-medium">{s.attendanceRecordedBy.fullName}</span></div>
                        </div>
                      )}
                      
                      {s.attendanceNote && (
                        <div className="mt-2 p-2 bg-blue-50 rounded-lg border-l-2 border-blue-400">
                          <div className="text-xs text-blue-800">Ghi chú: {s.attendanceNote}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6 flex flex-col items-center">
                      <div className="bg-gray-50 p-3 rounded-lg mb-2">
                        <UserCheck className="w-5 h-5 text-gray-600 mb-1" />
                        <div className="text-xs text-gray-500 text-center">Trạng thái</div>
                      </div>
                      {getAttendanceBadge(s.attendanceStatus)}
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
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-700 p-3 rounded-xl">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900">Lịch học</CardTitle>
                <p className="text-sm text-gray-600">Xem lịch học và trạng thái điểm danh</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={viewType} onValueChange={(v: ViewType) => setViewType(v)}>
                <SelectTrigger className="w-32 bg-white border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">📅 Tháng</SelectItem>
                  <SelectItem value="week">📊 Tuần</SelectItem>
                  <SelectItem value="list">📋 Danh sách</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handlePrev} className="border-blue-200 hover:bg-blue-50">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext} className="border-blue-200 hover:bg-blue-50">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="border-blue-200 hover:bg-blue-50">
                Hôm nay
              </Button>
            </div>
          </div>
          {viewType === "month" && (
            <div className="mt-3 flex items-center space-x-2">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-lg font-semibold text-blue-800">{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
              </div>
            </div>
          )}
          {viewType === "week" && (
            <div className="mt-3 flex items-center space-x-2">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-lg font-semibold text-blue-800">
                  {getWeekRange().startOfWeek.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })} 
                  - {getWeekRange().endOfWeek.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" })}
                </span>
              </div>
            </div>
          )}
          {viewType === "list" && (
            <div className="mt-3 flex items-center space-x-2">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-lg font-semibold text-blue-800">{MONTH_NAMES[currentDate.getMonth()]}, {currentDate.getFullYear()}</span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {error ? (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 text-sm">{error}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "list" && renderListView()}
        </CardContent>
      </Card>
    </div>
  )
}