"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Star, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  UserX,
  AlertCircle,
  FileText,
  TrendingUp,
  Loader2
} from "lucide-react"
import { classService } from "../../../../services/center-owner/class-management/class.service"
import Loading from "../../../../components/Loading/LoadingPage"

interface DashboardTabProps {
  classId: string
  classData?: any
}

export default function DashboardTab({ classId, classData }: DashboardTabProps) {
  // Fetch dashboard data
  const { data: dashboardResponse, isLoading, error } = useQuery({
    queryKey: ['classDashboard', classId],
    queryFn: () => classService.getDashboard(classId),
    enabled: !!classId,
    staleTime: 3000,
    refetchOnWindowFocus: true
  })
  

  const dashboardData = (dashboardResponse as any)?.data || {
    teachers: 0,
    students: 0,
    lessons: 0,
    revenue: 0,
    rating: 0,
    reviews: 0,
    attendance: {
      onTime: 0,
      late: 0,
      excusedAbsence: 0,
      unexcusedAbsence: 0,
      notMarked: 0
    },
    homework: {
      assigned: 0,
      submitted: 0,
      notSubmitted: 0
    }
  }

  const getStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  // Loading state
  if (isLoading) {
    return <Loading/>
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Có lỗi xảy ra khi tải dashboard</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Giáo viên */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData.teachers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Giáo viên
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Học viên */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData.students}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Học viên
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buổi học */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData.lessons}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Buổi học đã diễn ra
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doanh thu */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {dashboardData.revenue.toLocaleString()} ₫
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Doanh thu học phí ghi nhận
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Báo cáo điểm danh */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo điểm danh</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const total = dashboardData.attendance.onTime + 
                           dashboardData.attendance.late + 
                           dashboardData.attendance.excusedAbsence + 
                           dashboardData.attendance.unexcusedAbsence + 
                           dashboardData.attendance.notMarked

              if (total === 0) {
                return (
                  <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-2" />
                      <p>Chưa có dữ liệu điểm danh</p>
                    </div>
                  </div>
                )
              }

              return (
                <div className="flex">
                  <div className="flex-1 pr-6">
                    {/* Bar chart */}
                    <div className="space-y-4">
                      {/* Đúng giờ */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Đúng giờ</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dashboardData.attendance.onTime}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(dashboardData.attendance.onTime / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Đi muộn */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Đi muộn</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dashboardData.attendance.late}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(dashboardData.attendance.late / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Nghỉ có phép */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Nghỉ có phép</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dashboardData.attendance.excusedAbsence}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(dashboardData.attendance.excusedAbsence / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Nghỉ không phép */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Nghỉ không phép</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dashboardData.attendance.unexcusedAbsence}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-red-500 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(dashboardData.attendance.unexcusedAbsence / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Chưa điểm danh */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">Chưa điểm danh</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dashboardData.attendance.notMarked}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-gray-400 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(dashboardData.attendance.notMarked / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>

        {/* Báo cáo bài tập */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.homework.assigned === 0 ? (
              <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-2" />
                  <p>Chưa có bài tập nào</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    Đã giao
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {dashboardData.homework.assigned}
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Đã nộp */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Đã nộp</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {dashboardData.homework.submitted}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(dashboardData.homework.submitted / dashboardData.homework.assigned) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  {/* Chưa nộp */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Chưa nộp</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {dashboardData.homework.notSubmitted}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-orange-400 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${(dashboardData.homework.notSubmitted / dashboardData.homework.assigned) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đánh giá */}
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá trung bình</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {dashboardData.reviews === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500">
                <Star className="h-12 w-12 mx-auto mb-2" />
                <p>Chưa có đánh giá nào</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {dashboardData.rating.toFixed(1)}
                </div>
                <div className="flex justify-center space-x-1 mb-2">
                  {getStarRating(dashboardData.rating)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {dashboardData.reviews} đánh giá
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Đánh giá gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-sm">Tính năng đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
