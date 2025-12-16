"use client"
import { useAuth } from "../../lib/auth"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { studentScheduleService } from "../../services/student/schedule/schedule.service"
import { studentGradesService } from "../../services/student/grades/grades.service"
import { studentProfileService } from "../../services/student/profile/profile.service"
import { studentEnrollmentService } from "../../services/student/enrollment/enrollment.service"

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

  // Lấy danh sách enrollments để đếm lớp đang học
  const { data: enrollments } = useQuery({
    queryKey: ["studentEnrollments"],
    queryFn: () => studentEnrollmentService.getEnrollments(),
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

  const { data: weekly } = useQuery({
    queryKey: ["studentWeeklySchedule", weekStart],
    queryFn: () => studentScheduleService.getWeeklySchedule(weekStart),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })


  const upcomingSessions = useMemo(() => {
    const sessions = Array.isArray(weekly) ? weekly : []
    
    return sessions
      .filter((s: unknown) => {
        const session = s as Record<string, unknown>
        const sessionDate = session.sessionDate || session.date
        if (!sessionDate) return false
        
        const rawDateStr = typeof sessionDate === 'string' ? sessionDate : new Date(sessionDate as string).toISOString()
        const sessionDateOnly = rawDateStr.includes('T') ? rawDateStr.split('T')[0] : rawDateStr
        const start = new Date(`${sessionDateOnly}T${(session.startTime as string) ?? '00:00'}`)
        return start >= new Date()
      })
      .sort((a: unknown, b: unknown) => {
        const sessionA = a as Record<string, unknown>
        const sessionB = b as Record<string, unknown>
        const aDate = sessionA.sessionDate || sessionA.date
        const bDate = sessionB.sessionDate || sessionB.date
        if (!aDate || !bDate) return 0
        
        const aRaw = typeof aDate === 'string' ? aDate : new Date(aDate as string).toISOString()
        const bRaw = typeof bDate === 'string' ? bDate : new Date(bDate as string).toISOString()
        const aOnly = aRaw.includes('T') ? aRaw.split('T')[0] : aRaw
        const bOnly = bRaw.includes('T') ? bRaw.split('T')[0] : bRaw
        return Number(new Date(`${aOnly}T${(sessionA.startTime as string) ?? '00:00'}`)) - Number(new Date(`${bOnly}T${(sessionB.startTime as string) ?? '00:00'}`))
      })
      .slice(0, 5)
  }, [weekly])

  // Điểm tổng quan (GPA tích lũy)
  const { data: gradesOverview } = useQuery({
    queryKey: ["studentGradesOverview"],
    queryFn: () => studentGradesService.getOverview(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan học tập</h1>
        <p className="text-sm text-gray-600">
          Xin chào, <span className="font-medium">{displayName}</span>
          {profile?.studentCode && (
            <span className="ml-2 text-xs text-gray-500">(MSSV: {profile.studentCode})</span>
          )}
        </p>
      </div>

      {/* Lối tắt nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/student/my-classes" className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-800">Lớp học của tôi</h3>
            <p className="text-sm text-gray-500">Xem danh sách lớp và chi tiết</p>
          </div>
        </a>
        
        <a href="/student/my-schedule" className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-800">Lịch học</h3>
            <p className="text-sm text-gray-500">Xem theo tuần/tháng</p>
          </div>
        </a>
        
        <a href="/student/my-grades" className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-800">Bảng điểm</h3>
            <p className="text-sm text-gray-500">Xem điểm và kết quả</p>
          </div>
        </a>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {Array.isArray(enrollments)
              ? enrollments.filter((e: unknown) => {
                  const enrollment = e as Record<string, unknown>
                  const status = enrollment.status as string
                  return status === "active" || status === "studying"
                }).length
              : 0}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-800">Lớp đang học</div>
          <div className="text-xs text-gray-500 mt-1">Số lớp bạn đang tham gia</div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {upcomingSessions?.length ?? 0}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-800">Buổi sắp tới trong tuần</div>
          <div className="text-xs text-gray-500 mt-1">Số buổi học sắp diễn ra</div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {gradesOverview?.cumulativeGpa?.toFixed
              ? gradesOverview.cumulativeGpa.toFixed(2)
              : gradesOverview?.cumulativeGpa ?? 0}
          </div>
          <div className="mt-2 text-sm font-medium text-gray-800">GPA tích lũy</div>
          <div className="text-xs text-gray-500 mt-1">Điểm trung bình tổng kết</div>
        </div>
      </div>

      {/* Buổi học sắp tới */}
      {upcomingSessions && upcomingSessions.length > 0 && (
        <div className="border rounded-lg p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Buổi học sắp tới</h3>
          <div className="space-y-3">
            {upcomingSessions.slice(0, 3).map((session: unknown, index: number) => {
              const sessionData = session as Record<string, unknown>
              const sessionDate = sessionData.sessionDate || sessionData.date
              const rawDateStr =
                typeof sessionDate === "string"
                  ? sessionDate
                  : new Date(sessionDate as string).toISOString()
              const sessionDateOnly = rawDateStr.includes("T")
                ? rawDateStr.split("T")[0]
                : rawDateStr
              const date = new Date(sessionDateOnly)

              const subjectName =
                (((sessionData.class as Record<string, unknown>)?.subject as Record<
                  string,
                  unknown
                >)?.name as string) ||
                ((sessionData.subject as Record<string, unknown>)?.name as string) ||
                "Lớp học"

              const roomName =
                ((sessionData.room as Record<string, unknown>)?.name as string) ||
                "Chưa xác định"
              
              return (
                <div
                  key={(sessionData.id as string) || index}
                  className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{subjectName}</div>
                    <div className="text-sm text-gray-600">
                      {date.toLocaleDateString("vi-VN")} •{" "}
                      {sessionData.startTime as string} -{" "}
                      {sessionData.endTime as string}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-800">
                      {roomName}
                    </div>
                    <div className="text-xs text-gray-500">Phòng học</div>
                  </div>
                </div>
              )
            })}
          </div>
          {upcomingSessions.length > 3 && (
            <div className="mt-4 text-center">
              <a
                href="/student/my-schedule"
                className="text-sm text-blue-700 hover:text-blue-800 font-medium"
              >
                Xem tất cả {upcomingSessions.length} buổi học →
              </a>
            </div>
          )}
        </div>
      )}
      
    </div>
  )
} 