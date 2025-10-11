"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  BookOpen, 
  User,
  ArrowLeft,
  CheckCircle,
  CalendarDays,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import Loading from "../../../components/Loading/LoadingPage"
import { teacherScheduleService } from "../../../services/teacherScheduleService"

interface SessionDetails {
  id: string
  date: string
  startTime: string
  endTime: string
  subject: string
  className: string
  room: string
  studentCount: number
  status: string
  notes?: string
  type: string
  teacherId: string
  students?: Array<{
    id: string
    name: string
    avatar?: string
    attendanceStatus?: string
  }>
  teacherName?: string
}

export default function SessionDetails() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    newDate: '',
    newStartTime: '',
    newEndTime: '',
    reason: '',
    notes: ''
  })
  const [isStudentsListOpen, setIsStudentsListOpen] = useState(false)

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        setError("Không tìm thấy ID buổi học")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await teacherScheduleService.getSessionDetail(sessionId)
        console.log(data)
        setSession(data)
      } catch (e) {
        console.error(e)
        setError("Không thể tải thông tin buổi học")
      } finally {
        setLoading(false)
      }
    }

    fetchSessionDetails()
  }, [sessionId])

  const handleAttendance = () => {
    if (session) {
      navigate(`/teacher/schedule/attendance/${session.id}`)
    }
  }

  const handleReschedule = () => {
    if (session) {
      setRescheduleData({
        newDate: session.date,
        newStartTime: session.startTime,
        newEndTime: session.endTime,
        reason: '',
        notes: ''
      })
      setIsRescheduleDialogOpen(true)
    }
  }

  const handleRescheduleSubmit = async () => {
    if (!session || !rescheduleData.newDate || !rescheduleData.newStartTime || !rescheduleData.newEndTime || !rescheduleData.reason) {
      return
    }

    try {
      setRescheduleLoading(true)
      const response = await teacherScheduleService.rescheduleSession(session.id, rescheduleData)
      if (response.success) {
        setSession(response.data)
        setIsRescheduleDialogOpen(false)
        // Show success message
        alert('Dời lịch thành công!')
      }
    } catch (error) {
      console.error('Error rescheduling session:', error)
      alert('Có lỗi xảy ra khi dời lịch. Vui lòng thử lại.')
    } finally {
      setRescheduleLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled": return "Đã lên lịch"
      case "completed": return "Đã hoàn thành"
      case "cancelled": return "Đã hủy"
      default: return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "regular": return "bg-purple-100 text-purple-800"
      case "exam": return "bg-blue-100 text-blue-800"
      case "makeup": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "regular": return "Buổi học thường"
      case "exam": return "Buổi thi"
      case "makeup": return "Buổi học bù"
      default: return type
    }
  }

  if (loading) return <Loading />

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-800 mb-2">Lỗi</h2>
              <p className="text-red-600 mb-4">{error || "Không tìm thấy thông tin buổi học"}</p>
              <Button onClick={() => navigate("/teacher/schedule")} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại lịch dạy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <>
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-2 mt-4">
            <span
              onClick={() => navigate('/teacher/schedule')}
              className="text-gray-600 text-base cursor-pointer hover:text-blue-600"
            >
              Lịch dạy
            </span>
            <span className="text-gray-400"> &gt; </span>
            <span className="text-gray-900 font-medium">Chi tiết buổi học</span>
          </div>
        </div>
      </div>
      </>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session?.className}</h1>
            <p className="text-gray-600">{session?.subject}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getStatusColor(session?.status || "")} px-3 py-1`}>
            {getStatusText(session?.status || "")}
          </Badge>
          <Badge className={`${getTypeColor(session?.type || "")} px-3 py-1`}>
            {getTypeText(session?.type || "")}
          </Badge>
        </div>
      </div>

      {/* Session Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Thông tin buổi học
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày diễn ra</p>
                    <p className="font-medium">{new Date(session?.date || "").toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-medium">{session?.startTime || ""} - {session?.endTime || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phòng học</p>
                    <p className="font-medium">{session?.room || ""}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Số học viên</p>
                    <p className="font-medium">{session?.studentCount || 0}</p>
                  </div>
                </div>
              </div>

              {session?.notes && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Ghi chú</h4>
                  <p className="text-gray-600">{session?.notes || ""}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          {session?.students && session?.students.length > 0 && (
            <Card>
              <Collapsible open={isStudentsListOpen} onOpenChange={setIsStudentsListOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Danh sách học viên ({session?.students.length || 0})
                      </div>
                      {isStudentsListOpen ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-3">
                      {session?.students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.avatar || ""} />
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {student.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name}</p>
                            </div>
                          </div>
                          {student.attendanceStatus && (
                            <Badge 
                              className={`${
                                student.attendanceStatus === 'present' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {student.attendanceStatus === 'present' ? 'Có mặt' : 'Vắng mặt'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Thao tác
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAttendance}
                className="w-full"
                disabled={session?.status === 'cancelled'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Điểm danh
              </Button>
              
              <Button 
                onClick={handleReschedule}
                variant="outline"
                className="w-full"
                disabled={session?.status === 'completed' || session?.status === 'cancelled'}
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Dời lịch
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Giáo viên
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {session?.teacherName?.split(" ").map((n: string) => n[0]).join("").slice(0,2) || "GV"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{session?.teacherName || "Giáo viên"}</p>
                  <p className="text-sm text-gray-500">Giáo viên phụ trách</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dời lịch buổi học</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newDate">Ngày mới</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={rescheduleData.newDate}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, newDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="newStartTime">Giờ bắt đầu</Label>
                <Input
                  id="newStartTime"
                  type="time"
                  value={rescheduleData.newStartTime}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, newStartTime: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newEndTime">Giờ kết thúc</Label>
                <Input
                  id="newEndTime"
                  type="time"
                  value={rescheduleData.newEndTime}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, newEndTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="reason">Lý do dời lịch *</Label>
                <Input
                  id="reason"
                  placeholder="Nhập lý do dời lịch"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Ghi chú thêm</Label>
              <Textarea
                id="notes"
                placeholder="Nhập ghi chú thêm (tùy chọn)"
                value={rescheduleData.notes}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsRescheduleDialogOpen(false)}
                disabled={rescheduleLoading}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleRescheduleSubmit}
                disabled={rescheduleLoading || !rescheduleData.newDate || !rescheduleData.newStartTime || !rescheduleData.newEndTime || !rescheduleData.reason}
              >
                {rescheduleLoading ? 'Đang xử lý...' : 'Dời lịch'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
