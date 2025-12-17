"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Loading from "../../../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../../../services/student/classInformation/classInformation.service"

interface StudentsTabProps {
  classId: string
}

export function StudentsTab({ classId }: StudentsTabProps) {
  const membersQuery = useQuery({
    queryKey: ["student", "class-members", classId],
    queryFn: () => studentClassInformationService.getClassMembers(classId),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const getStatusLabel = (status?: string) => {
    const s = (status || 'studying').toLowerCase()
    if (s === 'studying') return 'Đang học'
    if (s === 'not_been_updated') return 'Chưa cập nhật'
    if (s === 'graduated') return 'Đã hoàn thành'
    if (s === 'stopped') return 'Dừng học'
    if (s === 'withdrawn') return 'Chuyển lớp'
    return 'Không xác định'
  }

  const statusClasses = (status?: string) => {
    const s = (status || "studying").toLowerCase()
    if (s === "studying")
      return "bg-green-100 text-green-800 border border-green-300"
    if (s === "not_been_updated")
      return "bg-yellow-100 text-yellow-800 border border-yellow-300"
    if (s === "graduated")
      return "bg-gray-100 text-gray-800 border border-gray-300"
    if (s === "stopped" || s === "withdrawn")
      return "bg-red-100 text-red-800 border border-red-300"
    return "bg-gray-100 text-gray-800 border border-gray-300"
  }

  return (
    <Card className="border rounded">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900">
          Danh sách học viên
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {membersQuery.isLoading ? (
          <Loading />
        ) : membersQuery.isError ? (
          <div className="p-3 text-sm text-red-700 border border-red-200 rounded">
            Không thể tải danh sách thành viên. Vui lòng thử lại sau.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(membersQuery.data as any[]).map((m: any) => (
              <div
                key={m.id}
                className="border rounded p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-800 truncate">
                      {m.fullName}
                    </div>
                    <div className="text-xs text-gray-500">Học viên</div>
                  </div>
                  <Badge
                    className={`${statusClasses(
                      m.status
                    )} flex items-center gap-1 text-xs`}
                  >
                    {getStatusLabel(m.status)}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mt-2">
                  <div className="truncate">{m.email}</div>
                  <div>MSSV: {m.studentCode || "Chưa có"}</div>
                </div>
              </div>
            ))}
            {(!membersQuery.data || (membersQuery.data as any[]).length === 0) && (
              <div className="col-span-full text-center py-8 text-sm text-gray-600">
                Chưa có thành viên trong lớp.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
