"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, MapPin, User2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Loading from "../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../services/student/classInformation/classInformation.service"

export default function StudentClassDetailPage() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["student", "class-detail", classId],
    queryFn: () => studentClassInformationService.getClassDetail(classId as string),
    enabled: !!classId,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const detail: any = useMemo(() => data ?? null, [data])

  const membersQuery = useQuery({
    queryKey: ["student", "class-members", classId],
    queryFn: () => studentClassInformationService.getClassMembers(classId as string),
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

  if (isLoading) return <Loading />
  if (isError || !detail) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-sm text-red-600">Không thể tải chi tiết lớp học</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/student/my-classes')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
            </Button>
            <CardTitle className="text-2xl font-bold flex-1 text-center truncate">{detail.subject?.name || detail.name}</CardTitle>
            <span className="w-[88px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Trạng thái:</span>
              <Badge className={statusClasses('active')}>{getStatusLabel('active')}</Badge>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Giáo viên:</span>
              <User2 className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{detail.teacher?.user?.fullName || 'Đang cập nhật'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Phòng:</span>
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="font-medium">{detail.room?.name || 'Chưa phân phòng'}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Thời gian:</span>
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-medium">
                {(detail.startDate ? new Date(detail.startDate).toLocaleDateString('vi-VN') : '-')}
                {' '} - {' '}
                {(detail.endDate ? new Date(detail.endDate).toLocaleDateString('vi-VN') : '-')}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Sĩ số:</span>
              <Users className="w-4 h-4 text-amber-500" />
              <span className="font-medium">{detail.currentStudents}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Môn học:</span>
              <Badge variant="secondary">{detail.subject?.name}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList>
          <TabsTrigger value="attendance">Bản ghi điểm danh</TabsTrigger>
          <TabsTrigger value="members">Thành viên</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <div className="text-sm text-muted-foreground">Sẽ hiển thị các buổi và trạng thái (Có mặt, Vắng, Chưa mở, Có phép).</div>
        </TabsContent>
        <TabsContent value="members">
          {membersQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : membersQuery.isError ? (
            <div className="text-sm text-red-600">Không thể tải danh sách thành viên</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(membersQuery.data as any[]).map((m) => (
                <div key={m.id} className="border rounded p-3 bg-white">
                  <div className="font-medium truncate">{m.fullName}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                  <div className="text-xs mt-1">MSSV: {m.studentCode || '-'}</div>
                  <div className="text-xs text-muted-foreground">Tham gia: {new Date(m.enrolledAt).toLocaleDateString('vi-VN')}</div>
                  <div className="mt-1"><Badge className={(m.status || '').toLowerCase() === 'active' ? 'bg-green-100 text-green-700 border border-green-200' : (m.status || '').toLowerCase() === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' : (m.status || '').toLowerCase() === 'completed' ? 'bg-blue-100 text-blue-700 border border-blue-200' : (m.status || '').toLowerCase() === 'cancelled' || (m.status || '').toLowerCase() === 'canceled' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}>{(() => {
                    const s = (m.status || '').toLowerCase()
                    if (s === 'active') return 'Đang học'
                    if (s === 'pending') return 'Chờ duyệt'
                    if (s === 'completed') return 'Hoàn thành'
                    if (s === 'cancelled' || s === 'canceled') return 'Đã hủy'
                    return m.status || 'Không xác định'
                  })()}</Badge></div>
                </div>
              ))}
              {(!membersQuery.data || (membersQuery.data as any[]).length === 0) && (
                <div className="text-sm text-muted-foreground">Chưa có thành viên</div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}