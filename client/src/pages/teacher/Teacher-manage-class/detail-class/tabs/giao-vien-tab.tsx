"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, User as UserIcon, Edit } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface GiaoVienTabProps {
  classData: any
}

export default function GiaoVienTab({ classData }: GiaoVienTabProps) {
  const teacher = {
    id: classData?.teacherId,
    name: classData?.teacherName ?? "N/A",
    email: classData?.teacherEmail ?? "N/A",
    phone: classData?.teacherPhone ?? "N/A",
  }

  const getInitials = (fullName: string) => {
    return (
      fullName
        ?.split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase() || "?"
    )
  }

  return (
    <div className="space-y-6">
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            Thông tin giáo viên
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-bold">
                {getInitials(teacher?.name ?? "")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {teacher?.name ?? "N/A"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ID: {teacher?.id ?? "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <a
                    href={`mailto:${teacher?.email}`}
                    className="hover:text-blue-600 transition-colors duration-200 break-all"
                  >
                    {teacher?.email}
                  </a>
                </div>

                {teacher?.phone && teacher?.phone !== "N/A" && (
                  <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <a
                      href={`tel:${teacher?.phone}`}
                      className="hover:text-green-600 transition-colors duration-200"
                    >
                      {teacher?.phone}
                    </a>
                  </div>
                )}
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Edit className="w-4 h-4" />
                Thay đổi giáo viên
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Information */}
      {classData?.subject && (
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle>Môn học</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Tên môn học
              </label>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {classData?.subject?.name ?? "N/A"}
              </p>
            </div>

            {classData?.subject?.description && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Mô tả
                </label>
                <p className="text-gray-700 dark:text-gray-300">
                  {classData?.subject?.description}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Mã môn học
              </label>
              <p className="text-gray-700 dark:text-gray-300 font-mono">
                {classData?.subject?.code ?? "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
