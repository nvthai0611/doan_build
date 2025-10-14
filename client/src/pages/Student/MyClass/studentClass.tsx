"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { studentEnrollmentService } from "../../../services/student/enrollment/enrollment.service"
import Loading from "../../../components/Loading/LoadingPage"
import { studentClassInformationService } from "../../../services/student/classInformation/classInformation.service"

export default function StudentClassesPage() {
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student", "enrollments"],
    queryFn: () => studentEnrollmentService.getEnrollments(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const subjectsQuery = useQuery({
    queryKey: ["student", "enrolled-subjects"],
    queryFn: () => studentClassInformationService.getEnrolledSubjects(),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const enrollments: any[] = useMemo(() => Array.isArray(data) ? data : [], [data])

  const toVietnameseStatus = (status?: string) => {
    switch ((status || '').toLowerCase()) {
      case 'active':
        return 'Đang học'
      case 'pending':
        return 'Chờ duyệt'
      case 'completed':
        return 'Hoàn thành'
      case 'cancelled':
      case 'canceled':
        return 'Đã hủy'
      default:
        return status || 'Không xác định'
    }
  }

  const statusClasses = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') return 'bg-green-100 text-green-700 border border-green-200'
    if (s === 'pending') return 'bg-amber-100 text-amber-700 border border-amber-200'
    if (s === 'completed') return 'bg-blue-100 text-blue-700 border border-blue-200'
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-100 text-red-700 border border-red-200'
    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Không thể tải danh sách lớp học</p>
              <p className="text-xs text-muted-foreground">Vui lòng thử lại sau</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>Thử lại</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Môn học đã ghi danh</CardTitle>
        </CardHeader>
        <CardContent>
          {subjectsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Đang tải...</div>
          ) : subjectsQuery.isError ? (
            <div className="text-sm text-red-600">Không thể tải danh sách môn học</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []).map((s: any) => (
                <Badge key={s.id} variant="secondary">{s.name}</Badge>
              ))}
              {(!subjectsQuery.data || (subjectsQuery.data as any[]).length === 0) && (
                <span className="text-sm text-muted-foreground">Chưa có môn học nào</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Lớp học của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">Bạn chưa ghi danh lớp học nào.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {enrollments.map((en) => (
                <div key={en.id} className="border rounded-lg p-4 bg-white hover:shadow-sm transition" role="button">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        className="text-base font-semibold text-left text-primary hover:underline truncate"
                        onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}
                        title={en.class?.name}
                      >
                        {en.class?.name}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {en.class?.subject?.name && <Badge variant="secondary">{en.class?.subject?.name}</Badge>}
                        {en.class?.room?.name && <span>Phòng: {en.class?.room?.name}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge className={statusClasses(en.status)}>{toVietnameseStatus(en.status)}</Badge>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}>
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}