"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Danh sách học viên
        </CardTitle>
      </CardHeader>
      <CardContent>
        {membersQuery.isLoading ? (
          <Loading />
        ) : membersQuery.isError ? (
          <div className="text-sm text-red-600">Không thể tải danh sách thành viên</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(membersQuery.data as any[]).map((m) => (
              <div key={m.id} className="border rounded p-3 bg-white">
                <div className="font-medium truncate">{m.fullName}</div>
                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                <div className="text-xs mt-1">MSSV: {m.studentCode || '-'}</div>
                <div className="text-xs text-muted-foreground">
                  Tham gia: {new Date(m.enrolledAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="mt-1">
                  <Badge className={statusClasses(m.status)}>
                    {getStatusLabel(m.status)}
                  </Badge>
                </div>
              </div>
            ))}
            {(!membersQuery.data || (membersQuery.data as any[]).length === 0) && (
              <div className="text-sm text-muted-foreground">Chưa có thành viên</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
