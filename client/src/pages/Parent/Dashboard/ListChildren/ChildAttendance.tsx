"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Eye, UserCheck, CheckCircle, XCircle, AlertCircle, BookOpen, BarChart3, Target } from "lucide-react"
import Loading from "../../../../components/Loading/LoadingPage"
import { parentChildService } from "../../../../services/parent/child-management/child.service"
import type { Child } from "../../../../services/parent/child-management/child.types"
import { AttendanceDetailsDialog } from "./AttendanceDetailsDialog"
import { getDisplaySessionStatus } from "../../../../utils/session-status.util"
import { parentChildClassesService } from "../../../../services/parent/child-classes/child-classes.service"
import type { ChildClass } from "../../../../services/parent/child-classes/child-classes.types"

interface ChildAttendanceProps {
  child: Child
}

export function ChildAttendance({ child }: ChildAttendanceProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<any | undefined>(undefined)
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined)

  // Lấy danh sách lớp mà học sinh này đang theo học
  const { data: childClassesData } = useQuery({
    queryKey: ["parent-child-classes", child.id],
    queryFn: () => parentChildClassesService.getChildClasses(child.id),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!child.id,
  })

  const enrolledClasses: ChildClass[] = useMemo(() => {
    if (!childClassesData) return []
    const topLevelData = (childClassesData as any)?.data ?? childClassesData

    // Trường hợp BE trả về trực tiếp mảng classes: { success, data: Class[] }
    if (Array.isArray(topLevelData)) {
      return topLevelData as ChildClass[]
    }

    // Trường hợp cũ: { data: { enrolledClasses: Class[] } }
    const nested = (topLevelData as any)?.enrolledClasses
    return Array.isArray(nested) ? nested as ChildClass[] : []
  }, [childClassesData])

  // Mặc định chọn lớp đầu tiên khi có dữ liệu
  if (!selectedClassId && enrolledClasses.length > 0) {
    setSelectedClassId(enrolledClasses[0].id)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["parent-child-attendance", child.id, selectedClassId],
    queryFn: async () => {
      const attendance = await parentChildService.getChildAttendance(child.id, selectedClassId)
      return attendance
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: !!child.id,
  })

  const attendanceRecords = useMemo(() => (data || []) as any[], [data])

  // Tính toán thống kê điểm danh
  const attendanceStats = useMemo(() => {
    const totalSessions = attendanceRecords.length
    const presentCount = attendanceRecords.filter(s => s.attendanceStatus === 'present').length
    const absentCount = attendanceRecords.filter(s => s.attendanceStatus === 'absent').length
    const lateCount = attendanceRecords.filter(s => s.attendanceStatus === 'late').length
    const excusedCount = attendanceRecords.filter(s => s.attendanceStatus === 'excused').length
    const notRecordedCount = attendanceRecords.filter(s => !s.attendanceStatus).length
    
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
  }, [attendanceRecords])

  const statusBadge = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled') return "bg-blue-100 text-blue-700 border border-blue-200"
    if (s === 'completed') return "bg-green-100 text-green-700 border border-green-200"
    if (s === 'cancelled') return "bg-red-100 text-red-700 border border-red-200"
    if (s === 'has_not_happened') return "bg-gray-100 text-gray-700 border border-gray-200"
    if (s === 'happening') return "bg-amber-100 text-amber-700 border border-amber-200"
    if (s === 'incomplete') return "bg-orange-100 text-orange-700 border border-orange-200"
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
    const base = "px-2 py-1 text-xs border rounded"
    switch (status) {
      case 'present':
        return <span className={`${base} bg-gray-100 text-gray-800`}>Có mặt</span>
      case 'absent':
        return <span className={`${base} bg-gray-100 text-gray-800`}>Vắng mặt</span>
      case 'late':
        return <span className={`${base} bg-gray-100 text-gray-800`}>Đi muộn</span>
      case 'excused':
        return <span className={`${base} bg-gray-100 text-gray-800`}>Có phép</span>
      case null:
      case undefined:
      default:
        return <span className={`${base} bg-gray-50 text-gray-600`}>Chưa điểm danh</span>
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
              <p className="text-sm font-medium text-red-800">Không thể tải thông tin điểm danh</p>
              <p className="text-xs text-red-600">Vui lòng thử lại sau</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Bộ lọc theo lớp */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Điểm danh theo lớp học</h2>
        <p className="text-sm text-muted-foreground">
          Chọn lớp mà con đang theo học để xem lịch sử điểm danh tương ứng.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Lọc theo lớp:</span>
          <select
            className="border rounded-md px-3 py-1 text-sm bg-white"
            value={selectedClassId || (enrolledClasses[0]?.id || "")}
            onChange={(e) => setSelectedClassId(e.target.value as any)}
          >
            {enrolledClasses.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
                {cls.subject?.name ? ` - ${cls.subject.name}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thống kê điểm danh */}
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Thống kê điểm danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-800">
            <div className="p-3 border rounded">
              <div className="text-2xl font-semibold">{attendanceStats.presentCount}</div>
              <div>Có mặt</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-semibold">{attendanceStats.absentCount}</div>
              <div>Vắng mặt</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-semibold">{attendanceStats.lateCount}</div>
              <div>Đi muộn</div>
            </div>
            <div className="p-3 border rounded">
              <div className="text-2xl font-semibold">{attendanceStats.excusedCount}</div>
              <div>Có phép</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
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
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Lịch sử điểm danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {attendanceRecords.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-8">
              Chưa có dữ liệu điểm danh. Dữ liệu sẽ được cập nhật khi có buổi học.
            </p>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center justify-between p-4 border rounded bg-white"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{`Buổi ${idx + 1}`}</p>
                      <Badge className={statusBadge(getDisplaySessionStatus(s as any))}>
                        {statusTextVi(getDisplaySessionStatus(s as any))}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.sessionDate || s.date).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.startTime || s.start_time} → {s.endTime || s.end_time}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSessionId(s.id)
                        setSelectedSession(s)
                        setDetailOpen(true)
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <AttendanceDetailsDialog open={detailOpen} onOpenChange={setDetailOpen} sessionId={selectedSessionId} session={selectedSession} child={child} />
    </div>
  )
}
