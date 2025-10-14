"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"   
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, TrendingUp, Award, BookOpen, Users } from "lucide-react"

interface GradesInfoProps {
  classId: string
}

export default function GradesInfo({ classId }: GradesInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "students" | "assignments">("overview")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const students = [
    {
      id: "1",
      name: "Nguyễn Văn An",
      avatar: "",
      overallGrade: 85,
      assignments: [
        { name: "Bài tập tuần 1", grade: 90, maxGrade: 100 },
        { name: "Dự án nhóm", grade: 85, maxGrade: 100 },
        { name: "Kiểm tra giữa kỳ", grade: 80, maxGrade: 100 }
      ],
      attendance: 95,
      participation: 88
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      avatar: "",
      overallGrade: 92,
      assignments: [
        { name: "Bài tập tuần 1", grade: 95, maxGrade: 100 },
        { name: "Dự án nhóm", grade: 90, maxGrade: 100 },
        { name: "Kiểm tra giữa kỳ", grade: 92, maxGrade: 100 }
      ],
      attendance: 98,
      participation: 95
    },
    {
      id: "3",
      name: "Lê Văn Cường",
      avatar: "",
      overallGrade: 78,
      assignments: [
        { name: "Bài tập tuần 1", grade: 75, maxGrade: 100 },
        { name: "Dự án nhóm", grade: 80, maxGrade: 100 },
        { name: "Kiểm tra giữa kỳ", grade: 78, maxGrade: 100 }
      ],
      attendance: 85,
      participation: 82
    }
  ]

  const classStats = {
    totalStudents: students.length,
    averageGrade: Math.round(students.reduce((sum, s) => sum + s.overallGrade, 0) / students.length),
    highestGrade: Math.max(...students.map(s => s.overallGrade)),
    lowestGrade: Math.min(...students.map(s => s.overallGrade)),
    passRate: Math.round((students.filter(s => s.overallGrade >= 60).length / students.length) * 100)
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return <Badge className="bg-green-100 text-green-800">Xuất sắc</Badge>
    if (grade >= 80) return <Badge className="bg-blue-100 text-blue-800">Giỏi</Badge>
    if (grade >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Khá</Badge>
    if (grade >= 60) return <Badge className="bg-orange-100 text-orange-800">Trung bình</Badge>
    return <Badge className="bg-red-100 text-red-800">Yếu</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Đánh giá</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi kết quả học tập và điểm số của học viên
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "overview"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "students"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Học viên
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "assignments"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Bài tập
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tổng học viên</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classStats.totalStudents}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Điểm trung bình</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classStats.averageGrade}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Điểm cao nhất</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classStats.highestGrade}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <BookOpen className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ đạt</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {classStats.passRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "students" && (
        <div className="space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm học viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Students Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Bảng điểm học viên ({filteredStudents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.avatar} alt={student.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span>Điểm danh: {student.attendance}%</span>
                          <span>Tham gia: {student.participation}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${getGradeColor(student.overallGrade)}`}>
                          {student.overallGrade}%
                        </p>
                        {getGradeBadge(student.overallGrade)}
                      </div>

                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-lg font-medium">Không tìm thấy học viên nào</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "assignments" && (
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết điểm bài tập</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => (
                <div key={student.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {student.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {student.assignments.map((assignment, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {assignment.name}
                        </p>
                        <p className={`text-lg font-bold ${getGradeColor(assignment.grade)}`}>
                          {assignment.grade}/{assignment.maxGrade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
