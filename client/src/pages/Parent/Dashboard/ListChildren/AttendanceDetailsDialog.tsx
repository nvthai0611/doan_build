import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, BookOpen, User, CheckCircle, CalendarDays, UserCheck, XCircle, AlertCircle } from "lucide-react"
import Loading from "../../../../components/Loading/LoadingPage"
import { parentChildService } from "../../../../services/parent/child-management/child.service"
import type { Child } from "../../../../services/parent/child-management/child.types"
import { getDisplaySessionStatus } from "../../../../utils/session-status.util"

interface AttendanceDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string
  session?: any
  child?: Child
}

export function AttendanceDetailsDialog({ open, onOpenChange, sessionId, session: sessionProp, child }: AttendanceDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any | null>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!open) return
      // Ưu tiên dùng dữ liệu có sẵn từ list để hiển thị ngay
      if (sessionProp) {
        setSession(sessionProp)
        return
      }
      if (!sessionId) return
      try {
        setLoading(true)
        setError(null)
        // Có thể gọi API chi tiết session nếu cần
        // const data = await parentChildService.getSessionDetail(sessionId)
        // setSession(data as any)
      } catch (e) {
        setError("Không thể tải thông tin buổi học")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [open, sessionId, sessionProp])

  const getStatusColor = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'has_not_happened': return 'bg-gray-100 text-gray-800'
      case 'happening': return 'bg-amber-100 text-amber-800'
      case 'incomplete': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  // Normalize fields to handle different shapes from API
  const getDateText = () => {
    const d = (session as any)?.sessionDate || (session as any)?.date
    return d ? new Date(d).toLocaleDateString('vi-VN') : '-'
  }
  const getTimeText = () => {
    const start = (session as any)?.startTime || (session as any)?.start_time
    const end = (session as any)?.endTime || (session as any)?.end_time
    if (!start && !end) return '-'
    return `${start || ''}${start || end ? ' - ' : ''}${end || ''}`
  }
  const getRoomText = () => {
    const roomObj = (session as any)?.room
    const roomStr = (session as any)?.roomName || (session as any)?.room
    return roomObj?.name || roomStr || 'Chưa phân phòng'
  }
  const getSubjectName = () => (session as any)?.class?.subject?.name || (session as any)?.subject || 'Môn học'
  const getClassName = () => (session as any)?.class?.name || (session as any)?.className || 'Lớp học'
  const getTeacherName = () => (session as any)?.class?.teacher?.user?.fullName || (session as any)?.teacher || 'Giáo viên'

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết điểm danh</DialogTitle>
        </DialogHeader>
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {getSubjectName()}
                </div>
                <div className="text-muted-foreground">{getClassName()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(getDisplaySessionStatus(session as any))}>{statusTextVi(getDisplaySessionStatus(session as any))}</Badge>
                {getAttendanceBadge((session as any)?.attendanceStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Thông tin buổi học</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Ngày diễn ra</p>
                          <p className="font-medium">{getDateText()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Thời gian</p>
                          <p className="font-medium">{getTimeText()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Phòng học</p>
                          <p className="font-medium">{getRoomText()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Giáo viên</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{getTeacherName()}</div>
                        <div className="text-sm text-muted-foreground">Phụ trách lớp</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Thông tin điểm danh */}
                {(session as any)?.attendanceStatus && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Thông tin điểm danh
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        {getAttendanceBadge((session as any)?.attendanceStatus)}
                      </div>
                      
                      {(session as any)?.attendanceRecordedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Thời gian điểm danh:</span>
                          <span className="text-sm font-medium">
                            {new Date((session as any).attendanceRecordedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                      
                      {(session as any)?.attendanceRecordedBy && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Điểm danh bởi:</span>
                          <span className="text-sm font-medium">{(session as any).attendanceRecordedBy}</span>
                        </div>
                      )}
                      
                      {(session as any)?.attendanceNote && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-2 border-yellow-400">
                          <div className="text-sm text-yellow-800">
                            <span className="font-medium">Ghi chú:</span> {(session as any).attendanceNote}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
