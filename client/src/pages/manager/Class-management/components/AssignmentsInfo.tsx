"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, FileText, Calendar, Users } from "lucide-react"

interface AssignmentsInfoProps {
  classId: string
}

export default function AssignmentsInfo({ classId }: AssignmentsInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "overdue">("all")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const assignments = [
    {
      id: "1",
      title: "Bài tập về nhà tuần 1",
      description: "Làm bài tập ngữ pháp về thì hiện tại đơn",
      type: "homework",
      dueDate: "2024-01-20",
      status: "completed",
      submissions: 8,
      totalStudents: 10,
      points: 10,
      createdBy: "Nguyễn Thị Lan"
    },
    {
      id: "2",
      title: "Dự án nhóm: Thuyết trình",
      description: "Chuẩn bị thuyết trình 5 phút về chủ đề gia đình",
      type: "project",
      dueDate: "2024-01-25",
      status: "active",
      submissions: 3,
      totalStudents: 10,
      points: 20,
      createdBy: "Nguyễn Thị Lan"
    },
    {
      id: "3",
      title: "Bài kiểm tra giữa kỳ",
      description: "Kiểm tra kiến thức từ bài 1-5",
      type: "exam",
      dueDate: "2024-01-30",
      status: "active",
      submissions: 0,
      totalStudents: 10,
      points: 50,
      createdBy: "Nguyễn Thị Lan"
    },
    {
      id: "4",
      title: "Bài tập đọc hiểu",
      description: "Đọc và trả lời câu hỏi về bài đọc",
      type: "homework",
      dueDate: "2024-01-18",
      status: "overdue",
      submissions: 5,
      totalStudents: 10,
      points: 15,
      createdBy: "Nguyễn Thị Lan"
    }
  ]

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && assignment.status === "active"
    if (activeTab === "completed") return matchesSearch && assignment.status === "completed"
    if (activeTab === "overdue") return matchesSearch && assignment.status === "overdue"
    
    return matchesSearch
  })

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "homework":
        return <Badge className="bg-blue-100 text-blue-800">Bài tập</Badge>
      case "project":
        return <Badge className="bg-purple-100 text-purple-800">Dự án</Badge>
      case "exam":
        return <Badge className="bg-red-100 text-red-800">Kiểm tra</Badge>
      default:
        return <Badge variant="secondary">Khác</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang mở</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Đã đóng</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>
      default:
        return <Badge variant="secondary">Không xác định</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Công việc</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý bài tập và dự án của lớp học
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo công việc
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
                  placeholder="Tìm kiếm công việc..."
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
                Tất cả ({assignments.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "active"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Đang mở ({assignments.filter(a => a.status === "active").length})
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "completed"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Đã đóng ({assignments.filter(a => a.status === "completed").length})
              </button>
              <button
                onClick={() => setActiveTab("overdue")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "overdue"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Quá hạn ({assignments.filter(a => a.status === "overdue").length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách công việc ({filteredAssignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      {assignment.points}đ
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {assignment.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {assignment.submissions}/{assignment.totalStudents} nộp bài
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Tạo bởi: {assignment.createdBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-2">
                    {getTypeBadge(assignment.type)}
                    {getStatusBadge(assignment.status)}
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredAssignments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có công việc nào</p>
                  <p className="text-sm">Tạo công việc đầu tiên cho lớp học</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
