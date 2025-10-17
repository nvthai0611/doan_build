import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, BookOpen, User, CheckCircle, CalendarDays } from "lucide-react"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentScheduleService } from "../../../../../services/student/schedule/schedule.service"
import type { StudentSession } from "../../../../../services/student/schedule/schedule.types"

interface SessionDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string
  session?: any
  classInfo?: any
}

export function SessionDetailsDialog({ open, onOpenChange, sessionId, session: sessionProp, classInfo }: SessionDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<StudentSession | null>(null)

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
        const data = await studentScheduleService.getSessionById(sessionId)
        setSession(data as any)
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const statusTextVi = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'scheduled' || s === 'planned') return 'Sắp tới'
    if (s === 'completed' || s === 'done') return 'Hoàn thành'
    if (s === 'cancelled' || s === 'canceled') return 'Đã hủy'
    if (s === 'ongoing' || s === 'in_progress') return 'Đang diễn ra'
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
  const getSubjectName = () => (session as any)?.class?.subject?.name || classInfo?.subject?.name || (session as any)?.subject || 'Môn học'
  const getClassName = () => (session as any)?.class?.name || classInfo?.name || (session as any)?.className || 'Lớp học'
  const getTeacherName = () => (session as any)?.class?.teacher?.user?.fullName || classInfo?.teacher?.user?.fullName || (session as any)?.teacherName || 'Giáo viên'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết buổi học</DialogTitle>
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
                <Badge className={getStatusColor(session?.status)}>{statusTextVi(session?.status)}</Badge>
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
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
