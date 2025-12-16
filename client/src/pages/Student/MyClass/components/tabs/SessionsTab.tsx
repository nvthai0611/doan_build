import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"
import type { StudentSession } from "../../../../../services/student/schedule/schedule.types"
import { SessionDetailsDialog } from "./SessionDetailsDialog"
import { getDisplaySessionStatus, type SessionData } from "../../../../../utils/session-status.util"

interface SessionsTabProps {
  classId: string
  classStartDate?: string
  classEndDate?: string
  classInfo?: {
    subject?: { name?: string }
    name?: string
    teacher?: { user?: { fullName?: string } }
  }
}

export function SessionsTab({ classId, classInfo }: SessionsTabProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<StudentSession | undefined>(undefined)

  const { data, isLoading, isError } = useQuery<StudentSession[]>({
    queryKey: ["student", "class-sessions", classId],
    queryFn: async () => {
      const sessions = await studentClassInformationService.getClassSessions(classId)
      return sessions as StudentSession[]
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!classId,
  })

  const rows: StudentSession[] = useMemo(() => (data || []) as StudentSession[], [data])

  // Tính toán thống kê điểm danh
  const attendanceStats = useMemo(() => {
    const totalSessions = rows.length
    const presentCount = rows.filter(s => s.attendanceStatus === 'present').length
    const absentCount = rows.filter(s => s.attendanceStatus === 'absent').length
    const lateCount = rows.filter(s => s.attendanceStatus === 'late').length
    const excusedCount = rows.filter(s => s.attendanceStatus === 'excused').length
    const notRecordedCount = rows.filter(s => !s.attendanceStatus).length
    
    const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount + excusedCount) / totalSessions) * 100) : 0
    
    return {
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      notRecordedCount,
      attendanceRate
    }
  }, [rows])

  const statusBadge = (status?: string) => {
    const s = (status || "").toLowerCase()
    if (s === "scheduled") return "bg-gray-100 text-gray-700 border border-gray-200"
    if (s === "completed") return "bg-green-100 text-green-700 border border-green-200"
    if (s === "cancelled") return "bg-red-100 text-red-700 border border-red-200"
    if (s === "has_not_happened") return "bg-gray-100 text-gray-700 border border-gray-200"
    if (s === "happening") return "bg-yellow-100 text-yellow-800 border border-yellow-200"
    if (s === "incomplete") return "bg-orange-100 text-orange-800 border border-orange-200"
    return "bg-gray-100 text-gray-700 border border-gray-200"
  }

  const statusTextVi = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled') return 'Sắp tới'
    if (s === 'completed') return 'Hoàn thành'
    if (s === 'cancelled') return 'Đã hủy'
    if (s === 'has_not_happened') return 'Chưa diễn ra'
    if (s === 'happening') return 'Đang diễn ra'
    if (s === 'incomplete') return 'Chưa hoàn thành'
    return 'Không xác định'
  }

  const getAttendanceBadge = (status?: string | null) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs">
            Có mặt
          </Badge>
        )
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs">
            Vắng mặt
          </Badge>
        )
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs">
            Đi muộn
          </Badge>
        )
      case "excused":
        return (
          <Badge className="bg-gray-100 text-gray-800 border border-gray-200 text-xs">
            Có phép
          </Badge>
        )
      case null:
      case undefined:
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Chưa điểm danh
          </Badge>
        )
    }
  }

  if (isLoading) return <Loading />
  if (isError) {
    return (
      <div className="p-4 text-sm text-red-700 border border-red-200 rounded">
        Không thể tải danh sách buổi học. Vui lòng thử lại sau.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Thống kê điểm danh */}
      <Card className="border rounded">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Thống kê điểm danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div className="border rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {attendanceStats.presentCount}
              </div>
              <div className="text-xs text-gray-600">Có mặt</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {attendanceStats.absentCount}
              </div>
              <div className="text-xs text-gray-600">Vắng mặt</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {attendanceStats.lateCount}
              </div>
              <div className="text-xs text-gray-600">Đi muộn</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {attendanceStats.excusedCount}
              </div>
              <div className="text-xs text-gray-600">Có phép</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-lg font-bold text-gray-900">
                {attendanceStats.attendanceRate}%
              </div>
              <div className="text-xs text-gray-600">Tỷ lệ tham dự</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600 flex justify-between">
            <span>
              Tổng số buổi học: <strong>{attendanceStats.totalSessions}</strong>
            </span>
            <span>
              Chưa điểm danh: <strong>{attendanceStats.notRecordedCount}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách buổi học */}
      <Card className="border rounded">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Danh sách buổi học
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {rows.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              Chưa có buổi học nào. Lịch học sẽ được cập nhật sớm.
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-4 border rounded bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{`Buổi ${idx + 1}`}</p>
                      <Badge
                        className={`${statusBadge(
                          getDisplaySessionStatus(s as unknown as SessionData)
                        )} text-xs`}
                      >
                        {statusTextVi(getDisplaySessionStatus(s as unknown as SessionData))}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                      <div>
                        {new Date(s.sessionDate).toLocaleDateString("vi-VN")}
                      </div>
                      <div>
                        {s.startTime} - {s.endTime}
                      </div>
                      {s.room?.name && <div>{s.room?.name}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getAttendanceBadge(s.attendanceStatus)}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setSelectedSessionId(s.id)
                        setSelectedSession(s)
                        setDetailOpen(true)
                      }}
                    >
                      Xem
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SessionDetailsDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        sessionId={selectedSessionId}
        session={selectedSession}
        classInfo={classInfo}
      />
    </div>
  )
}
