import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Eye, UserCheck, TrendingUp, CheckCircle, XCircle, AlertCircle, BookOpen, Users, BarChart3, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"
import type { StudentSession } from "../../../../../services/student/schedule/schedule.types"
import { SessionDetailsDialog } from "./SessionDetailsDialog"

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
    const s = (status || '').toLowerCase()
    if (s === 'scheduled' || s === 'planned') return "bg-blue-100 text-blue-700 border border-blue-200"
    if (s === 'completed' || s === 'done') return "bg-green-100 text-green-700 border border-green-200"
    if (s === 'cancelled' || s === 'canceled') return "bg-red-100 text-red-700 border border-red-200"
    if (s === 'ongoing' || s === 'in_progress') return "bg-amber-100 text-amber-700 border border-amber-200"
    return "bg-gray-100 text-gray-700 border border-gray-200"
  }

  const statusTextVi = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled' || s === 'planned') return 'Sắp tới'
    if (s === 'completed' || s === 'done') return 'Hoàn thành'
    if (s === 'cancelled' || s === 'canceled') return 'Đã hủy'
    if (s === 'ongoing' || s === 'in_progress') return 'Đang diễn ra'
    return 'Không xác định'
  }

  const getAttendanceBadge = (status?: string | null) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Có mặt
        </Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Vắng mặt
        </Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Đi muộn
        </Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
          <UserCheck className="w-3 h-3" />
          Có phép
        </Badge>
      case null:
      case undefined:
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Chưa điểm danh
        </Badge>
    }
  }

  if (isLoading) return <Loading />
  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Không thể tải danh sách buổi học</p>
              <p className="text-xs text-red-600">Vui lòng thử lại sau</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Thống kê điểm danh */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
          <CardTitle className="flex items-center gap-2 text-emerald-800">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            Thống kê điểm danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all">
              <div className="p-2 bg-green-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">{attendanceStats.presentCount}</div>
              <div className="text-sm text-green-600 font-medium">Có mặt</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200 hover:shadow-md transition-all">
              <div className="p-2 bg-red-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700">{attendanceStats.absentCount}</div>
              <div className="text-sm text-red-600 font-medium">Vắng mặt</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200 hover:shadow-md transition-all">
              <div className="p-2 bg-yellow-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-700">{attendanceStats.lateCount}</div>
              <div className="text-sm text-yellow-600 font-medium">Đi muộn</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
              <div className="p-2 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{attendanceStats.excusedCount}</div>
              <div className="text-sm text-blue-600 font-medium">Có phép</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:shadow-md transition-all">
              <div className="p-2 bg-blue-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{attendanceStats.attendanceRate}%</div>
              <div className="text-sm text-blue-600 font-medium">Tỷ lệ tham dự</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Tổng số buổi học: <strong>{attendanceStats.totalSessions}</strong></span>
              <span>Chưa điểm danh: <strong>{attendanceStats.notRecordedCount}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách buổi học */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
          Danh sách buổi học
        </CardTitle>
      </CardHeader>
        <CardContent className="p-6">
        {rows.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">Chưa có buổi học nào</p>
              <p className="text-sm text-gray-500 mt-1">Lịch học sẽ được cập nhật sớm</p>
            </div>
        ) : (
          <div className="space-y-4">
            {rows.map((s, idx) => (
                <div key={s.id} className="flex items-center justify-between p-5 border rounded-xl hover:shadow-lg transition-all duration-300 bg-white border-l-4 border-l-blue-500">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                  <p className="font-medium">{`Buổi ${idx + 1}`}</p>
                      <Badge className={statusBadge(s.status)}>{statusTextVi(s.status)}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.sessionDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.startTime} → {s.endTime}
                      </div>
                  {s.room?.name && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {s.room?.name}
                        </div>
                  )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {getAttendanceBadge(s.attendanceStatus)}
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedSessionId(s.id); setSelectedSession(s); setDetailOpen(true) }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
      
      <SessionDetailsDialog open={detailOpen} onOpenChange={setDetailOpen} sessionId={selectedSessionId} session={selectedSession} classInfo={classInfo} />
    </div>
  )
}
