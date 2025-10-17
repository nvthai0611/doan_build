"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Clock, MapPin, User2, Users, ArrowRight } from "lucide-react"
import { formatDate } from "../../../../../utils/format"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"

interface GeneralInfoTabProps {
  classData: {
    subject?: { name?: string }
    name?: string
    teacher?: { user?: { fullName?: string } }
    room?: { name?: string }
    startDate?: string
    endDate?: string
    currentStudents?: number
    recurringSchedule?: {
      schedules?: Array<{
        day: string
        startTime: string
        endTime: string
      }>
    }
  } | null
  classId: string
}

export function GeneralInfoTab({ classData, classId }: GeneralInfoTabProps) {
  // Fetch class members to get accurate student count
  const membersQuery = useQuery({
    queryKey: ["student", "class-members", classId],
    queryFn: () => studentClassInformationService.getClassMembers(classId),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Calculate actual student count from members data
  const actualStudentCount = membersQuery.data ? (membersQuery.data as unknown[]).length : 0
  const getStatusLabel = (status?: string) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active') return 'Đang học'
    if (s === 'pending') return 'Chờ duyệt'
    if (s === 'completed') return 'Hoàn thành'
    if (s === 'cancelled' || s === 'canceled') return 'Đã hủy'
    return 'Không xác định'
  }

  const statusClasses = (status?: string) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active') return 'bg-green-100 text-green-700 border border-green-200'
    if (s === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200'
    if (s === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200'
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-100 text-red-700 border border-red-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Class Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Chi tiết lớp học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tên lớp học</label>
              <p className="text-lg font-semibold mt-1">{classData?.subject?.name || classData?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Môn học</label>
              <p className="text-lg font-semibold mt-1">{classData?.subject?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Giáo viên</label>
              <div className="flex items-center gap-2 mt-1">
                <User2 className="w-4 h-4 text-slate-500" />
                <span className="text-lg font-semibold">{classData?.teacher?.user?.fullName || 'Đang cập nhật'}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phòng học</label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="text-lg font-semibold">{classData?.room?.name || 'Chưa phân phòng'}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
              <p className="text-lg font-semibold mt-1">
                {classData?.startDate ? formatDate(classData.startDate) : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
              <p className="text-lg font-semibold mt-1">
                {classData?.endDate ? formatDate(classData.endDate) : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sĩ số</label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-amber-500" />
                <span className="text-lg font-semibold">{actualStudentCount}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Trạng thái</label>
              <div className="mt-1">
                <Badge className={statusClasses('active')}>{getStatusLabel('active')}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      {classData?.recurringSchedule?.schedules && classData.recurringSchedule.schedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Lịch học hàng tuần
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {classData.recurringSchedule.schedules.map((item, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                >
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {item.day} {item.startTime} <ArrowRight className="inline-block" size={14} /> {item.endTime}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
