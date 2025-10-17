"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../assets/shadcn-ui/components/ui/dialog"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import type { Child } from "../../../services/parent"
import { useMutation } from "@tanstack/react-query"
import { parentChildService } from "../../../services"
import { MonthlyView, type CalendarViewType } from "./views/MonthlyView"
import { WeeklyView } from "./views/WeeklyView"
import { DailyView } from "./views/DailyView"
import type { ClassSessions } from "../../manager/Teacher-management/types/session"

interface ChildTimetableProps {
  child: Child
}

const monthlySchedule = {
  month: 10,
  year: 2025,
  days: [
    { date: 7, classes: [{ subject: "Vật lý", color: "bg-indigo-500" }] },
    {
      date: 8,
      classes: [
        { subject: "Toán học", color: "bg-indigo-500" },
        { subject: "Sinh học", color: "bg-indigo-500" },
      ],
    },
    { date: 10, classes: [{ subject: "Địa lý", color: "bg-indigo-500" }] },
    { date: 11, classes: [{ subject: "Toán học", color: "bg-indigo-500" }] },
    { date: 15, classes: [{ subject: "Ngữ văn", color: "bg-indigo-500" }], isHighlighted: true },
  ],
}

type ViewType = 'subject' | 'class' | 'room' | 'teacher'

export function ChildTimetable({ child }: ChildTimetableProps) {
  const [viewMode, setViewMode] = useState<CalendarViewType>("monthly")
  const [viewType, setViewType] = useState<ViewType>('subject')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [sessions, setSessions] = useState<any[]>([])
  const [selectedSession, setSelectedSession] = useState<ClassSessions | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)

  const getWeekRange = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const mondayOffset = day === 0 ? -6 : 1 - day
    const monday = new Date(d)
    monday.setDate(d.getDate() + mondayOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    return { start: monday, end: sunday }
  }
  const handlePrev = () => {
    if (viewMode === "daily") {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 1)
      setCurrentDate(d)
      return
    }
    if (viewMode === "weekly") {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
      return
    }
    // monthly
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNext = () => {
    if (viewMode === "daily") {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 1)
      setCurrentDate(d)
      return
    }
    if (viewMode === "weekly") {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
      return
    }
    // monthly
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const headerTitle = useMemo(() => {
    if (viewMode === "daily") {
      const dd = String(currentDate.getDate()).padStart(2, '0')
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
      const yyyy = currentDate.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }
    if (viewMode === "weekly") {
      const { start, end } = getWeekRange(currentDate)
      const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
      return `${fmt(start)} - ${fmt(end)}, ${currentDate.getFullYear()}`
    }
    const m = currentDate.getMonth() + 1
    const y = currentDate.getFullYear()
    return `Tháng ${m}, ${y}`
  }, [viewMode, currentDate])

  const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end }
  }

  const { mutate: fetchSchedule } = useMutation<any>({
    mutationFn: async () => {
      if (viewMode === "daily") {
        const iso = currentDate.toISOString().slice(0, 10)
        const res = await parentChildService.getChildSchedule(child.id, { startDate: iso, endDate: iso })
        return res
      }
      if (viewMode === "weekly") {
        const { start, end } = getWeekRange(currentDate)
        return parentChildService.getChildSchedule(child.id, {
          startDate: start.toISOString().slice(0, 10),
          endDate: end.toISOString().slice(0, 10),
        })
      }
      const { start, end } = getMonthRange(currentDate)
      return parentChildService.getChildSchedule(child.id, {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      })
    },
    onSuccess: (data: any[]) => {
      setSessions(Array.isArray(data) ? data : [])
    },
  })

  useEffect(() => {
    fetchSchedule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentDate, child.id])

  // Đồng bộ currentDate theo chế độ xem để tránh lệch tuần/tháng so với dữ liệu fetch
  useEffect(() => {
    if (viewMode === "weekly") {
      const { start } = getWeekRange(currentDate)
      if (currentDate.toDateString() !== start.toDateString()) {
        setCurrentDate(start)
      }
    } else if (viewMode === "monthly") {
      const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      if (currentDate.toDateString() !== firstOfMonth.toDateString()) {
        setCurrentDate(firstOfMonth)
      }
    }
  }, [viewMode])

  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()
  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate()
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m - 1, 1).getDay()
  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)

  const calendarDays = []
  // Add empty cells for days before the first day of month
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDays = getDaysInMonth(monthlySchedule.month - 1, monthlySchedule.year)
    calendarDays.push({ date: prevMonthDays - firstDay + i + 1, isCurrentMonth: false })
  }
  // Add days of current month (đổ dữ liệu thật nếu có)
  const groupedByDate = useMemo(() => {
    const m = new Map<number, any[]>()
    ;(sessions || []).forEach((s: any) => {
      const d = new Date(s.sessionDate)
      if (d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month) {
        const day = d.getUTCDate()
        const arr = m.get(day) || []
        arr.push(s)
        m.set(day, arr)
      }
    })
    return m
  }, [sessions, month, year])

  for (let i = 1; i <= daysInMonth; i++) {
    const classItems = (groupedByDate.get(i) || []).map((s: any) => ({
      subject: s.class?.subject?.name || s.class?.name,
      color: "bg-indigo-500",
    }))
    calendarDays.push({
      date: i,
      isCurrentMonth: true,
      classes: classItems,
      isHighlighted: false,
    })
  }
  // Add empty cells to complete the grid
  const remainingCells = 42 - calendarDays.length
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({ date: i, isCurrentMonth: false })
  }

  const weekDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]

  const toClassSessions = (items: any[]): ClassSessions[] => {
    return (items || []).map((s: any) => {
      // Dùng ngày local (YYYY-MM-DD) để tránh lệch múi giờ và khớp với view
      const d = new Date(s.sessionDate)
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const date = `${yyyy}-${mm}-${dd}`
      return {
        id: s.id,
        name: s.class?.name || '',
        date,
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        roomName: s.room?.name || '',
        teacherName: s.class?.teacher?.fullName || '',
        subjectName: s.class?.subject?.name || '',
        studentCount: 0,
        maxStudents: s.class?.maxStudents || 0,
        status: s.status || 'scheduled',
        hasAlert: false,
      }
    })
  }

  const classSessions: ClassSessions[] = toClassSessions(sessions)

  const handleSessionClick = (session: ClassSessions) => {
    setSelectedSession(session)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{headerTitle}</h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-transparent"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Hôm nay
          </Button>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "daily" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("daily")}
              className={viewMode === "daily" ? "bg-black text-white hover:bg-black/90" : ""}
            >
              Ngày
            </Button>
            <Button
              variant={viewMode === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("weekly")}
              className={viewMode === "weekly" ? "bg-black text-white hover:bg-black/90" : ""}
            >
              Tuần
            </Button>
            <Button
              variant={viewMode === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("monthly")}
              className={viewMode === "monthly" ? "bg-black text-white hover:bg-black/90" : ""}
            >
              Tháng
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant={viewType === "subject" ? "default" : "outline"} size="sm" onClick={() => setViewType("subject")}>Theo môn</Button>
        <Button variant={viewType === "class" ? "default" : "outline"} size="sm" onClick={() => setViewType("class")}>Theo lớp</Button>
        <Button variant={viewType === "room" ? "default" : "outline"} size="sm" onClick={() => setViewType("room")}>Theo phòng</Button>
        <Button variant={viewType === "teacher" ? "default" : "outline"} size="sm" onClick={() => setViewType("teacher")}>Theo GV</Button>
      </div>

      {viewMode === "monthly" && (
        <MonthlyView
          currentDate={currentDate}
          viewType={viewMode}
          onSessionClick={handleSessionClick}
          onDayClick={(date) => setCurrentDate(date)}
          sessions={classSessions}
        />
      )}

      {viewMode === "daily" && (
        <DailyView
          currentDate={currentDate}
          viewType={viewMode}
          onSessionClick={handleSessionClick}
          sessions={classSessions}
        />
      )}

      {viewMode === "weekly" && (
        <WeeklyView
          currentDate={currentDate}
          viewType={viewMode}
          onSessionClick={handleSessionClick}
          sessions={classSessions}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open: boolean) => { setIsDialogOpen(open); if (!open) setSelectedSession(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết buổi học</DialogTitle>
            <DialogDescription>Thông tin chi tiết của buổi học đã chọn</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Ngày</div>
                <div className="font-medium">{selectedSession.date}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Giờ học</div>
                <div className="font-medium">{selectedSession.startTime} - {selectedSession.endTime}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Lớp</div>
                <div className="font-medium">{selectedSession.name || 'Chưa xác định'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Môn</div>
                <div className="font-medium">{selectedSession.subjectName || 'Chưa xác định'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phòng</div>
                <div className="font-medium">{selectedSession.roomName || 'Chưa xác định'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Giáo viên</div>
                <div className="font-medium">{selectedSession.teacherName || 'Chưa xác định'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Sĩ số / Tối đa</div>
                <div className="font-medium">{selectedSession.studentCount} / {selectedSession.maxStudents}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Trạng thái</div>
                <div className="font-medium capitalize">{selectedSession.status}</div>
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
