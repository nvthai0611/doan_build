"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Plus, Search, MoreHorizontal } from "lucide-react"

interface LessonsInfoProps {
  classId: string
}

export default function LessonsInfo({ classId }: LessonsInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const lessons = [
    {
      id: "1",
      title: "Buổi 1: Giới thiệu khóa học",
      date: "2024-01-15",
      time: "19:45 - 21:15",
      status: "completed",
      attendance: 8,
      totalStudents: 10,
      room: "P1",
      teacher: "Nguyễn Thị Lan",
      notes: "Buổi học đầu tiên, giới thiệu chương trình học"
    },
    {
      id: "2",
      title: "Buổi 2: Ngữ pháp cơ bản",
      date: "2024-01-17",
      time: "19:45 - 21:15",
      status: "completed",
      attendance: 9,
      totalStudents: 10,
      room: "P1",
      teacher: "Nguyễn Thị Lan",
      notes: "Học về thì hiện tại đơn"
    },
    {
      id: "3",
      title: "Buổi 3: Từ vựng chủ đề gia đình",
      date: "2024-01-22",
      time: "19:45 - 21:15",
      status: "upcoming",
      attendance: 0,
      totalStudents: 10,
      room: "P1",
      teacher: "Nguyễn Thị Lan",
      notes: ""
    },
    {
      id: "4",
      title: "Buổi 4: Luyện nghe",
      date: "2024-01-24",
      time: "19:45 - 21:15",
      status: "upcoming",
      attendance: 0,
      totalStudents: 10,
      room: "P1",
      teacher: "Nguyễn Thị Lan",
      notes: ""
    }
  ]

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "upcoming") return matchesSearch && lesson.status === "upcoming"
    if (activeTab === "completed") return matchesSearch && lesson.status === "completed"
    if (activeTab === "cancelled") return matchesSearch && lesson.status === "cancelled"
    
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case "upcoming":
        return <Badge className="bg-blue-100 text-blue-800">Sắp tới</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Buổi học</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý lịch học và điểm danh
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Thêm buổi học
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm buổi học..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Tất cả ({lessons.length})
              </button>
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "upcoming"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Sắp tới ({lessons.filter(l => l.status === "upcoming").length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Hoàn thành ({lessons.filter(l => l.status === "completed").length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách buổi học ({filteredLessons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {new Date(lesson.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {lesson.title}
                    </h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {lesson.time}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {lesson.attendance}/{lesson.totalStudents} học viên
                      </div>
                      <span>Phòng: {lesson.room}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Giáo viên: {lesson.teacher}
                    </p>
                    {lesson.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        "{lesson.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {getStatusBadge(lesson.status)}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredLessons.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có buổi học nào</p>
                  <p className="text-sm">Thêm buổi học đầu tiên cho lớp</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
