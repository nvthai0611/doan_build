"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../../../../../utils/format"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"

interface GeneralInfoTabProps {
  classData: {
    status?: string
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

  return (
    <div className="space-y-6">
      {/* Class Information */}
      <Card className="border rounded">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-900">
            Thông tin lớp học
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Tên lớp học</div>
              <div className="mt-1 font-medium text-gray-900">{classData?.name || "-"}</div>
            </div>
            <div>
              <div className="text-gray-600">Môn học</div>
              <div className="mt-1 font-medium text-gray-900">{classData?.subject?.name || "-"}</div>
            </div>
            <div>
              <div className="text-gray-600">Giáo viên</div>
              <div className="mt-1 font-medium text-gray-900">
                {classData?.teacher?.user?.fullName || "Đang cập nhật"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Phòng học</div>
              <div className="mt-1 font-medium text-gray-900">
                {classData?.room?.name || "Chưa phân phòng"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Ngày bắt đầu</div>
              <div className="mt-1 font-medium text-gray-900">
                {classData?.startDate ? formatDate(classData.startDate) : "-"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Ngày kết thúc</div>
              <div className="mt-1 font-medium text-gray-900">
                {classData?.endDate ? formatDate(classData.endDate) : "-"}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Sĩ số</div>
              <div className="mt-1 font-medium text-gray-900">
                {actualStudentCount}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Card */}
      {classData?.recurringSchedule?.schedules &&
        classData.recurringSchedule.schedules.length > 0 && (
          <Card className="border rounded">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900">
                Lịch học hàng tuần
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                {classData.recurringSchedule.schedules.map((item, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border rounded px-3 py-2 bg-gray-50"
                  >
                    <div className="font-medium text-gray-800">{item.day}</div>
                    <div className="text-gray-700">
                      {item.startTime} - {item.endTime}
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
