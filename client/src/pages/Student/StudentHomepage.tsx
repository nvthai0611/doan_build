"use client"
import { useAuth } from "../../lib/auth"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, BookOpen, Target, TrendingUp } from "lucide-react"
import { studentScheduleService } from "../../services/student/schedule/schedule.service"
import { studentGradesService } from "../../services/student/grades/grades.service"

export default function     StudentHomepage() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || "Học sinh"

  // Buổi học sắp tới (5 buổi)
  const today = useMemo(() => new Date(), [])
  const weekStart = useMemo(() => {
    const d = new Date(today)
    const day = d.getDay() || 7
    d.setDate(d.getDate() - day + 1)
    return d.toISOString().slice(0, 10)
  }, [today])

  const { data: weekly } = useQuery({
    queryKey: ["studentWeeklySchedule", weekStart],
    queryFn: () => studentScheduleService.getWeeklySchedule(weekStart),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })

  const upcomingSessions = useMemo(() => {
    const sessions = Array.isArray(weekly) ? weekly : []
    return sessions
      .filter((s: any) => {
        const rawDateStr = typeof s.sessionDate === 'string' ? s.sessionDate : new Date(s.sessionDate).toISOString()
        const sessionDateOnly = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr
        const start = new Date(`${sessionDateOnly}T${s.startTime ?? '00:00'}`)
        return start >= new Date()
      })
      .sort((a: any, b: any) => {
        const aRaw = typeof a.sessionDate === 'string' ? a.sessionDate : new Date(a.sessionDate).toISOString()
        const bRaw = typeof b.sessionDate === 'string' ? b.sessionDate : new Date(b.sessionDate).toISOString()
        const aOnly = aRaw.includes('T') ? aRaw.split('T')[0] : aRaw
        const bOnly = bRaw.includes('T') ? bRaw.split('T')[0] : bRaw
        return Number(new Date(`${aOnly}T${a.startTime ?? '00:00'}`)) - Number(new Date(`${bOnly}T${b.startTime ?? '00:00'}`))
      })
      .slice(0, 5)
  }, [weekly])

  // Điểm mới cập nhật (từ transcript)
  const { data: transcript, isLoading: loadingTranscript } = useQuery({
    queryKey: ["studentTranscriptOverview"],
    queryFn: () => studentGradesService.getTranscript(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Tổng quan học sinh</h1>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold">Xin chào, {displayName}</h2>
        <p className="text-sm text-gray-500">Tổng hợp nhanh hoạt động học tập của bạn.</p>
      </div>
      {/* Lối tắt nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/student/my-classes" className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold">Lớp học của tôi</h3>
              <p className="text-sm text-gray-500">Xem danh sách lớp và chi tiết</p>
            </div>
          </div>
        </a>
        <a href="/student/my-schedule" className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="text-lg font-bold">Lịch học</h3>
              <p className="text-sm text-gray-500">Xem theo tuần/tháng</p>
            </div>
          </div>
        </a>
        <a href="/student/my-grades" className="bg-white border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-lg font-bold">Bảng điểm</h3>
              <p className="text-sm text-gray-500">Xem điểm và kết quả</p>
            </div>
          </div>
        </a>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Lớp đang học</div>
          <div className="mt-1 text-2xl font-bold">{
            Array.isArray(weekly) ? new Set(weekly.map((s: any) => s.classId || s.class?.id)).size : 0
          }</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">Buổi sắp tới trong tuần</div>
          <div className="mt-1 text-2xl font-bold">{upcomingSessions?.length ?? 0}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm text-gray-500">GPA tích lũy</div>
          <div className="mt-1 text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            {transcript?.overview?.cumulativeGpa?.toFixed ? transcript.overview.cumulativeGpa.toFixed(2) : (transcript?.overview?.cumulativeGpa ?? 0)}
          </div>
        </div>
      </div>
      
    </div>
  )
} 