"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  TrendingUp
} from "lucide-react"

interface DashboardTabProps {
  classId: string
  classData?: any
}

export default function DashboardTab({ classId, classData }: DashboardTabProps) {
  const mockData = {
    teachers: 1,
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

  const reviews = [
    {
      id: 1,
      studentName: "Nguyễn Văn A",
      rating: 5,
      comment: "Lớp học rất hay, giáo viên nhiệt tình",
      date: "2024-01-15"
    },
    {
      id: 2,
      studentName: "Trần Thị B", 
      rating: 4,
      comment: "Nội dung học phong phú, dễ hiểu",
      date: "2024-01-10"
    }
  ]

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

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Giáo viên */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mockData.teachers}
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
                {mockData.students}
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
                {mockData.lessons}
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
                {mockData.revenue.toLocaleString()} ₫
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
            <div className="flex">
              <div className="flex-1">
                {/* Chart area - empty for now */}
                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-2" />
                    <p>Chưa có dữ liệu điểm danh</p>
                  </div>
                </div>
              </div>
              <div className="ml-6 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đúng giờ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đi muộn</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nghỉ có phép</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nghỉ không phép</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Chưa điểm danh</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Báo cáo bài tập */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Đã giao
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {mockData.homework.assigned}
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Đã nộp</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-300 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Chưa nộp</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evaluation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đánh giá */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {mockData.rating}
              </div>
              <div className="flex justify-center space-x-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < mockData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {mockData.reviews} đánh giá
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Navigation */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="link" className="text-blue-600 hover:text-blue-700">
                Xem tất cả
              </Button>
            </div>
            
            {/* Placeholder for review content */}
            <div className="text-center text-gray-400 dark:text-gray-500">
              <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <p className="text-sm">Chưa có đánh giá nào</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
