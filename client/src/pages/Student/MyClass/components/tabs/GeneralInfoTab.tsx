"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Clock, MapPin, User2, Users, ArrowRight, GraduationCap, Building, CalendarDays, UserCheck, TrendingUp } from "lucide-react"
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
    if (s === 'active' || s === 'studying') return 'Đang học'
    if (s === 'not_been_updated') return 'Chưa cập nhật'
    if (s === 'completed') return 'Hoàn thành'
    if (s === 'dropped') return 'Đã bỏ học'
    return 'Không xác định'
  }

  const statusClasses = (status?: string) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active' || s === 'studying') return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-sm'
    if (s === 'not_been_updated') return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300 shadow-sm'
    if (s === 'completed') return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300 shadow-sm'
    if (s === 'dropped') return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300 shadow-sm'
    return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300 shadow-sm'
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Class Information Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            Chi tiết lớp học
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100">
              <label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Tên lớp học
              </label>
              <p className="text-lg font-semibold mt-2 text-gray-800">{classData?.name}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Môn học
              </label>
              <p className="text-lg font-semibold mt-2 text-gray-800">{classData?.subject?.name}</p>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-100">
              <label className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <User2 className="w-4 h-4" />
                Giáo viên
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1 bg-orange-100 rounded">
                  <UserCheck className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">{classData?.teacher?.user?.fullName || 'Đang cập nhật'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border border-cyan-100">
              <label className="text-sm font-medium text-cyan-700 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Phòng học
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1 bg-cyan-100 rounded">
                  <MapPin className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">{classData?.room?.name || 'Chưa phân phòng'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border border-rose-100">
              <label className="text-sm font-medium text-rose-700 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Ngày bắt đầu
              </label>
              <p className="text-lg font-semibold mt-2 text-gray-800">
                {classData?.startDate ? formatDate(classData.startDate) : '-'}
              </p>
            </div>
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-lg border border-violet-100">
              <label className="text-sm font-medium text-violet-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Ngày kết thúc
              </label>
              <p className="text-lg font-semibold mt-2 text-gray-800">
                {classData?.endDate ? formatDate(classData.endDate) : '-'}
              </p>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-100">
              <label className="text-sm font-medium text-amber-700 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Sĩ số
              </label>
              <div className="flex items-center gap-2 mt-2">
                <div className="p-1 bg-amber-100 rounded">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-lg font-semibold text-gray-800">{actualStudentCount}</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-100">
              <label className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Trạng thái
              </label>
              <div className="mt-2">
                <Badge className={`${statusClasses('active')} flex items-center gap-1 w-fit`}>
                  <UserCheck className="w-3 h-3" />
                  {getStatusLabel('active')}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      {classData?.recurringSchedule?.schedules && classData.recurringSchedule.schedules.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              Lịch học hàng tuần
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {classData.recurringSchedule.schedules.map((item, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-blue-900 text-lg">
                      {item.day}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-700 font-medium">{item.startTime}</span>
                      <ArrowRight className="text-blue-500" size={16} />
                      <span className="text-blue-700 font-medium">{item.endTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
