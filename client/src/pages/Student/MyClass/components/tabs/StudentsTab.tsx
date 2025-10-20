"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, User, Mail, Hash, Calendar, CheckCircle2, Clock, AlertCircle, UserCheck } from "lucide-react"
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
    if (s === 'active') return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-sm'
    if (s === 'pending') return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300 shadow-sm'
    if (s === 'completed') return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300 shadow-sm'
    if (s === 'cancelled' || s === 'canceled') return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300 shadow-sm'
    return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300 shadow-sm'
  }

  const getStatusIcon = (status?: string) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active') return <CheckCircle2 className="w-3 h-3" />
    if (s === 'pending') return <Clock className="w-3 h-3" />
    if (s === 'completed') return <CheckCircle2 className="w-3 h-3" />
    if (s === 'cancelled' || s === 'canceled') return <AlertCircle className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
        <CardTitle className="flex items-center gap-2 text-cyan-800">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Users className="h-5 w-5 text-cyan-600" />
          </div>
          Danh sách học viên
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {membersQuery.isLoading ? (
          <Loading />
        ) : membersQuery.isError ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Không thể tải danh sách thành viên</p>
              <p className="text-xs text-red-600">Vui lòng thử lại sau</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(membersQuery.data as any[]).map((m) => (
              <div key={m.id} className="border rounded-xl p-4 bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-l-cyan-500">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-full">
                      <User className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 truncate">{m.fullName}</div>
                      <div className="text-xs text-gray-500">Học viên</div>
                    </div>
                  </div>
                  <Badge className={`${statusClasses(m.status)} flex items-center gap-1`}>
                    {getStatusIcon(m.status)}
                    {getStatusLabel(m.status)}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1 bg-blue-100 rounded">
                      <Mail className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="truncate">{m.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="p-1 bg-green-100 rounded">
                      <Hash className="w-3 h-3 text-green-600" />
                    </div>
                    <span>MSSV: {m.studentCode || 'Chưa có'}</span>
                  </div>
                  
                  {/* Thời gian tham gia đã được yêu cầu ẩn */}
                </div>
              </div>
            ))}
            {(!membersQuery.data || (membersQuery.data as any[]).length === 0) && (
              <div className="col-span-full text-center py-12">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-600">Chưa có thành viên</p>
                <p className="text-sm text-gray-500 mt-1">Lớp học chưa có học viên nào</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
