"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "../../../../../utils/format"
import { MapPin, Users, BookOpen, Clock, User } from "lucide-react"

interface ThongTinChungTabProps {
  classData: any
}

export function ThongTinChungTab({ classData }: ThongTinChungTabProps) {
  const scheduleData = classData?.schedule?.schedules ?? []

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      draft: "Chưa diễn ra",
      active: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã Hủy",
    }
    return statusMap[status] ?? status
  }

  const getDayLabel = (day: string): string => {
    const dayMap: Record<string, string> = {
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật",
    }
    return dayMap[day] ?? day
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tên lớp học
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {classData?.name ?? "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Trạng thái
              </label>
              <Badge
                className={
                  classData?.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }
              >
                {getStatusLabel(classData?.status ?? "")}
              </Badge>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Mô tả
              </label>
              <p className="text-gray-700 dark:text-gray-300">
                {classData?.description ?? "Không có mô tả"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Năm học
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.academicYear ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      {scheduleData.length > 0 && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Lịch học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduleData.map((schedule: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[100px]">
                    {getDayLabel(schedule?.day ?? "")}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {schedule?.startTime ?? "--"} - {schedule?.endTime ?? "--"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Details */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Chi tiết lớp học
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Khối
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.grade?.name ?? "N/A"} (Cấp{" "}
                {classData?.grade?.level ?? "N/A"})
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Môn học
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.subject?.name ?? "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Phòng học
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.room?.name ?? "N/A"} ({classData?.room?.capacity ?? "N/A"}{" "}
                chỗ)
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Sức chứa tối đa
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.maxStudents ?? 0} học sinh
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Số học sinh hiện tại
              </label>
              <p className="text-green-600 dark:text-green-400 font-medium">
                {classData?.studentCount ?? 0}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tỷ lệ lấp đầy
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        classData?.maxStudents
                          ? Math.round((classData.studentCount / classData.maxStudents) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px]">
                  {classData?.maxStudents
                    ? Math.round((classData.studentCount / classData.maxStudents) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Information */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Thông tin giáo viên
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tên giáo viên
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.teacherName ?? "N/A"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Email
              </label>
              <p className="text-gray-900 dark:text-white break-all">
                {classData?.teacherEmail ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Thời gian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ngày bắt đầu dự kiến
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.expectedStartDate
                  ? formatDate(classData.expectedStartDate)
                  : "Chưa xác định"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ngày bắt đầu thực tế
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.actualStartDate
                  ? formatDate(classData.actualStartDate)
                  : "Chưa bắt đầu"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ngày kết thúc
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {classData?.actualEndDate
                  ? formatDate(classData.actualEndDate)
                  : "Chưa kết thúc"}
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Ngày tạo
              </label>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {classData?.createdAt ? formatDate(classData.createdAt) : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
