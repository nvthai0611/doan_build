"use client"
import { useAuth } from "../../lib/auth"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Calendar, BookOpen, Target, TrendingUp, Users, Clock, Award, ArrowRight, Sparkles, BarChart3, GraduationCap } from "lucide-react"
import { studentScheduleService } from "../../services/student/schedule/schedule.service"
import { studentGradesService } from "../../services/student/grades/grades.service"
import { studentProfileService } from "../../services/student/profile/profile.service"

export default function     StudentHomepage() {
  const { user } = useAuth()
  const displayName = user?.fullName || user?.email || "Học sinh"

  // Lấy MSSV từ hồ sơ
  const { data: profile } = useQuery({
    queryKey: ["studentProfileBasic"],
    queryFn: () => studentProfileService.getProfile(),
    staleTime: 300000,
    refetchOnWindowFocus: false,
  })

  // Buổi học sắp tới (5 buổi)
  const today = useMemo(() => new Date(), [])
  const weekStart = useMemo(() => {
    const d = new Date(today)
    const day = d.getDay() || 7
    d.setDate(d.getDate() - day + 1)
    return d.toISOString().slice(0, 10)
  }, [today])

  const { data: weekly, isLoading: loadingWeekly, error: weeklyError } = useQuery({
    queryKey: ["studentWeeklySchedule", weekStart],
    queryFn: () => studentScheduleService.getWeeklySchedule(weekStart),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })


  const upcomingSessions = useMemo(() => {
    const sessions = Array.isArray(weekly) ? weekly : []
    
    return sessions
      .filter((s: any) => {
        const sessionDate = s.sessionDate || s.date
        const rawDateStr = typeof sessionDate === 'string' ? sessionDate : new Date(sessionDate).toISOString()
        const sessionDateOnly = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr
        const start = new Date(`${sessionDateOnly}T${s.startTime ?? '00:00'}`)
        return start >= new Date()
      })
      .sort((a: any, b: any) => {
        const aDate = a.sessionDate || a.date
        const bDate = b.sessionDate || b.date
        const aRaw = typeof aDate === 'string' ? aDate : new Date(aDate).toISOString()
        const bRaw = typeof bDate === 'string' ? bDate : new Date(bDate).toISOString()
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
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-blue-100 rounded-full">
            <GraduationCap className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-blue-800">Tổng quan học sinh</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Xin chào, {displayName}</h2>
          {profile?.studentCode && (
            <span className="text-sm text-blue-700 bg-white rounded-md px-3 py-1 border border-blue-200 shadow-sm">
              MSSV: {profile.studentCode}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-2">Tổng hợp nhanh hoạt động học tập của bạn.</p>
      </div>
      {/* Lối tắt nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <a href="/student/my-classes" className="group bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Lớp học của tôi</h3>
                <p className="text-sm text-gray-500">Xem danh sách lớp và chi tiết</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </a>
        
        <a href="/student/my-schedule" className="group bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500 hover:border-l-green-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors">Lịch học</h3>
                <p className="text-sm text-gray-500">Xem theo tuần/tháng</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
          </div>
        </a>
        
        <a href="/student/my-grades" className="group bg-white border rounded-xl p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-rose-500 hover:border-l-rose-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl group-hover:bg-rose-200 transition-colors">
                <Target className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-rose-600 transition-colors">Bảng điểm</h3>
                <p className="text-sm text-gray-500">Xem điểm và kết quả</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </div>
        </a>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-700">{
                Array.isArray(weekly) ? new Set(weekly.map((s: any) => s.classId || s.class?.id)).size : 0
              }</div>
            </div>
          </div>
          <div className="text-sm font-medium text-blue-800">Lớp đang học</div>
          <div className="text-xs text-blue-600 mt-1">Số lớp bạn đang tham gia</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-700">{upcomingSessions?.length ?? 0}</div>
            </div>
          </div>
          <div className="text-sm font-medium text-green-800">Buổi sắp tới trong tuần</div>
          <div className="text-xs text-green-600 mt-1">Số buổi học sắp diễn ra</div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-amber-700 flex items-center gap-1">
                {transcript?.overview?.cumulativeGpa?.toFixed ? transcript.overview.cumulativeGpa.toFixed(2) : (transcript?.overview?.cumulativeGpa ?? 0)}
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
          <div className="text-sm font-medium text-amber-800">GPA tích lũy</div>
          <div className="text-xs text-amber-600 mt-1">Điểm trung bình tổng kết</div>
        </div>
      </div>

      {/* Buổi học sắp tới */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Buổi học sắp tới</h3>
          </div>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((session: any, index: number) => {
              const sessionDate = session.sessionDate || session.date
              const rawDateStr = typeof sessionDate === 'string' ? sessionDate : new Date(sessionDate).toISOString()
              const sessionDateOnly = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr
              const date = new Date(sessionDateOnly)
              
              return (
                <div key={session.id || index} className="flex items-center gap-4 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{session.class?.subject?.name || session.subject?.name || 'Lớp học'}</div>
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString('vi-VN')} • {session.startTime} - {session.endTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">{session.room?.name || 'Chưa xác định'}</div>
                    <div className="text-xs text-gray-500">Phòng học</div>
                  </div>
                </div>
              )
            })}
          </div>
          {upcomingSessions.length > 3 && (
            <div className="mt-4 text-center">
              <a href="/student/my-schedule" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Xem tất cả {upcomingSessions.length} buổi học →
              </a>
            </div>
          )}
        </div>
      )}
      
    </div>
  )
} 