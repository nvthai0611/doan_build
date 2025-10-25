"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Eye, UserCheck, CheckCircle, XCircle, AlertCircle, BookOpen, BarChart3, Target } from "lucide-react"
import Loading from "../../../components/Loading/LoadingPage"
import { parentChildService } from "../../../services/parent/child-management/child.service"
import type { Child } from "../../../services/parent/child-management/child.types"
import { AttendanceDetailsDialog } from "./AttendanceDetailsDialog"
import { getDisplaySessionStatus } from "../../../utils/session-status.util"

interface ChildAttendanceProps {
  child: Child
}

export function ChildAttendance({ child }: ChildAttendanceProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined)
  const [selectedSession, setSelectedSession] = useState<any | undefined>(undefined)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["parent-child-attendance", child.id],
    queryFn: async () => {
      const attendance = await parentChildService.getChildAttendance(child.id)
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
            Lịch sử điểm danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">Chưa có dữ liệu điểm danh</p>
              <p className="text-sm text-gray-500 mt-1">Dữ liệu sẽ được cập nhật khi có buổi học</p>
            </div>
          ) : (
            <div className="space-y-4">
              {attendanceRecords.map((s, idx) => (
                <div key={s.id || idx} className="flex items-center justify-between p-5 border rounded-xl hover:shadow-lg transition-all duration-300 bg-white border-l-4 border-l-blue-500">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{`Buổi ${idx + 1}`}</p>
                      <Badge className={statusBadge(getDisplaySessionStatus(s as any))}>{statusTextVi(getDisplaySessionStatus(s as any))}</Badge>
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
      
      <AttendanceDetailsDialog open={detailOpen} onOpenChange={setDetailOpen} sessionId={selectedSessionId} session={selectedSession} child={child} />
    </div>
  )
}
