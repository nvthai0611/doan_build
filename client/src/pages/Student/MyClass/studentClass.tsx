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
import { EnrollmentStatus, ENROLLMENT_STATUS_LABELS } from "../../../lib/constants"

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
    if (!status) return 'Không xác định'
    const normalizedStatus = status.toLowerCase()
    // Sử dụng labels từ constants để đảm bảo nhất quán
    const statusMap: Record<string, string> = {
      'studying': ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STUDYING],
      'not_been_updated': ENROLLMENT_STATUS_LABELS[EnrollmentStatus.NOT_BEEN_UPDATED],
      'stopped': ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STOPPED],
      'graduated': ENROLLMENT_STATUS_LABELS[EnrollmentStatus.GRADUATED],
      'withdrawn': ENROLLMENT_STATUS_LABELS[EnrollmentStatus.WITHDRAWN],
    }
    return statusMap[normalizedStatus] || status || 'Không xác định'
  }

  const statusClasses = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'studying') return 'bg-green-100 text-green-800 border border-green-300'
    if (s === 'not_been_updated') return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    if (s === 'graduated') return 'bg-blue-100 text-blue-800 border border-blue-300'
    if (s === 'stopped') return 'bg-red-100 text-red-800 border border-red-300'
    if (s === 'withdrawn') return 'bg-orange-100 text-orange-800 border border-orange-300'
    return 'bg-gray-100 text-gray-800 border border-gray-300'
  }

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <div className="border border-red-200 bg-red-50 rounded p-3 text-sm text-red-700 flex items-center justify-between gap-3">
              <div>
          <p className="font-medium">Không thể tải danh sách lớp học</p>
          <p className="text-xs">Vui lòng thử lại sau.</p>
              </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
              Thử lại
            </Button>
          </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Môn học đã ghi danh</h1>
        <div className="mt-3">
          {subjectsQuery.isLoading ? (
            <div className="text-sm text-gray-500">Đang tải...</div>
          ) : subjectsQuery.isError ? (
            <div className="text-sm text-red-600">Không thể tải danh sách môn học</div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []).map((s: any) => (
                <span
                  key={s.id}
                  className="inline-flex items-center rounded border px-3 py-1 text-xs text-gray-800 bg-gray-50"
                >
                  {s.name}
                </span>
              ))}
              {(!subjectsQuery.data || (subjectsQuery.data as any[]).length === 0) && (
                <div className="text-sm text-gray-500">Chưa có môn học nào</div>
              )}
            </div>
          )}
        </div>
            </div>

      <Card className="border rounded">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Lớp học của tôi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-medium text-gray-600">Bạn chưa ghi danh lớp học nào</p>
              <p className="text-sm text-gray-500 mt-1">Hãy liên hệ với giáo viên để được ghi danh</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrollments.map((en) => (
                <div
                  key={en.id}
                  className="border rounded p-4 bg-white hover:bg-gray-50 transition-colors"
                  role="button"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <button
                        className="text-base font-semibold text-left text-gray-800 hover:text-blue-600 truncate block w-full"
                        onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}
                        title={en.class?.name}
                      >
                        {en.class?.name}
                      </button>
                      <div className="mt-2 space-y-2">
                        {en.class?.subject?.name && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-600">
                              {en.class?.subject?.name}
                            </span>
                          </div>
                        )}
                        {en.class?.room?.name && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Phòng: {en.class?.room?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge className={`${statusClasses(en.status)} flex items-center gap-1 text-xs`}>
                        {toVietnameseStatus(en.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}
                      className="border-gray-300 text-gray-800 hover:bg-gray-100"
                    >
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