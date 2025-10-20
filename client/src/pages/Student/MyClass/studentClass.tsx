"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Users, 
  Calendar, 
  Clock, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
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
    if (s === 'active') return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300 shadow-sm'
    if (s === 'pending') return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-300 shadow-sm'
    if (s === 'completed') return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-300 shadow-sm'
    if (s === 'cancelled' || s === 'canceled') return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-300 shadow-sm'
    return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-300 shadow-sm'
  }

  const getStatusIcon = (status?: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'active') return <CheckCircle2 className="w-3 h-3" />
    if (s === 'pending') return <Clock className="w-3 h-3" />
    if (s === 'completed') return <CheckCircle2 className="w-3 h-3" />
    if (s === 'cancelled' || s === 'canceled') return <AlertCircle className="w-3 h-3" />
    return <AlertCircle className="w-3 h-3" />
  }

  if (isLoading) return <Loading />

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Không thể tải danh sách lớp học</p>
                <p className="text-xs text-red-600">Vui lòng thử lại sau</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="border-red-300 text-red-700 hover:bg-red-100">
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            Môn học đã ghi danh
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {subjectsQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Đang tải...
            </div>
          ) : subjectsQuery.isError ? (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              Không thể tải danh sách môn học
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {(Array.isArray(subjectsQuery.data) ? subjectsQuery.data : []).map((s: any) => (
                <Badge key={s.id} variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 px-3 py-1">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {s.name}
                </Badge>
              ))}
              {(!subjectsQuery.data || (subjectsQuery.data as any[]).length === 0) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  Chưa có môn học nào
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-green-800">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            Lớp học của tôi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-600">Bạn chưa ghi danh lớp học nào</p>
              <p className="text-sm text-gray-500 mt-1">Hãy liên hệ với giáo viên để được ghi danh</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrollments.map((en) => (
                <div key={en.id} className="border rounded-xl p-5 bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500" role="button">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0 flex-1">
                      <button
                        className="text-lg font-semibold text-left text-gray-800 hover:text-blue-600 transition-colors truncate block w-full"
                        onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}
                        title={en.class?.name}
                      >
                        {en.class?.name}
                      </button>
                      <div className="mt-2 space-y-2">
                        {en.class?.subject?.name && (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-purple-100 rounded">
                              <BookOpen className="w-3 h-3 text-purple-600" />
                            </div>
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                              {en.class?.subject?.name}
                            </Badge>
                          </div>
                        )}
                        {en.class?.room?.name && (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-orange-100 rounded">
                              <MapPin className="w-3 h-3 text-orange-600" />
                            </div>
                            <span className="text-sm text-gray-600">Phòng: {en.class?.room?.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Badge className={`${statusClasses(en.status)} flex items-center gap-1`}>
                        {getStatusIcon(en.status)}
                        {toVietnameseStatus(en.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => navigate(`/student/my-classes/${en.class?.id || en.classId}`)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all"
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
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