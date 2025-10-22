"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { parentChildService } from "../../../../services"
import { useMutation } from "@tanstack/react-query"

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  isToday: boolean
  hasEvent: boolean
  sessions?: any[]
}

import type { Child } from "../../../../services/parent/child-management/child.types"

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
  
  if (!childId) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Không có dữ liệu học sinh
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
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end }
  }

  const { mutate: fetchSchedule } = useMutation<any>({
    mutationFn: async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { start, end } = getMonthRange(currentDate)
        const response = await parentChildService.getChildSchedule(childId, {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
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
    if (childId) {
      fetchSchedule()
    }
  }, [currentDate, childId])

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

    // Group sessions by date
    const sessionsMap = new Map<number, any[]>()
    sessions.forEach((session) => {
      const sessionDate = new Date(session.sessionDate)
      if (
        sessionDate.getMonth() === currentDate.getMonth() &&
        sessionDate.getFullYear() === currentDate.getFullYear()
      ) {
        const day = sessionDate.getDate()
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

  const calendarDays = generateCalendarDays()
  const monthName = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })
  const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Lịch</h1>
          <p className="text-muted-foreground mt-1">Lịch học của con em</p>
          {isLoading && <p className="text-sm text-muted-foreground mt-1">Đang tải...</p>}
          {error && <p className="text-sm text-destructive mt-1">{error}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Bell className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{monthName}</CardTitle>
                  <CardDescription>Lịch học tháng này</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="w-4 h-4" />
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
                        ${day.isToday ? "bg-primary text-primary-foreground" : ""}
                        ${isSelected ? "ring-2 ring-offset-1 ring-primary" : ""}
                      `}
                    >
                      {day.date > 0 && <span className="leading-none">{day.date}</span>}
                      {day.hasEvent && day.isCurrentMonth && !day.isToday && (
                        <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>
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
                    const d = new Date(session.sessionDate)
                    return d.getDate() === sel.getDate() && d.getMonth() === sel.getMonth() && d.getFullYear() === sel.getFullYear()
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
                                      const records: any[] = await parentChildService.getChildAttendance(childId, session.classId || session.class?.id, iso, iso)
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
                              <div><strong>Trạng thái:</strong> {session.status}</div>
                              <div className="pt-2 border-t">
                                <strong>Điểm danh</strong>
                                {attendanceLoading[session.id] ? (
                                  <div className="text-sm text-muted-foreground">Đang tải điểm danh...</div>
                                ) : attendanceBySession[session.id]?.error ? (
                                  <div className="text-sm text-destructive">Không thể tải điểm danh</div>
                                ) : attendanceBySession[session.id] ? (
                                  <div className="text-sm text-muted-foreground">
                                    <div><strong>Trạng thái:</strong> {attendanceBySession[session.id].attendanceStatus || 'Chưa điểm danh'}</div>
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
  )
}
