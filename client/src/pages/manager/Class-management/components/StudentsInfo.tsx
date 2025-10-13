"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, MoreHorizontal, UserPlus } from "lucide-react"

interface StudentsInfoProps {
  classId: string
}

export default function StudentsInfo({ classId }: StudentsInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const students = [
    {
      id: "1",
      name: "Nguyễn Văn An",
      email: "an.nguyen@email.com",
      phone: "0123456789",
      avatar: "",
      status: "active",
      enrollmentDate: "2024-01-15",
      attendance: 85
    },
    {
      id: "2", 
      name: "Trần Thị Bình",
      email: "binh.tran@email.com",
      phone: "0987654321",
      avatar: "",
      status: "active",
      enrollmentDate: "2024-01-20",
      attendance: 92
    },
    {
      id: "3",
      name: "Lê Văn Cường",
      email: "cuong.le@email.com", 
      phone: "0111222333",
      avatar: "",
      status: "inactive",
      enrollmentDate: "2024-02-01",
      attendance: 78
    }
  ]

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && student.status === "active"
    if (activeTab === "inactive") return matchesSearch && student.status === "inactive"
    
    return matchesSearch
  })

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Học viên</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý danh sách học viên trong lớp
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm học viên
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
                  placeholder="Tìm kiếm học viên..."
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
                Tất cả ({students.length})
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "active"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Đang học ({students.filter(s => s.status === "active").length})
              </button>
              <button
                onClick={() => setActiveTab("inactive")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "inactive"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Tạm nghỉ ({students.filter(s => s.status === "inactive").length})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {student.email}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {student.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Điểm danh: {student.attendance}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Ghi danh: {new Date(student.enrollmentDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <Badge 
                    variant={student.status === "active" ? "default" : "secondary"}
                    className={student.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {student.status === "active" ? "Đang học" : "Tạm nghỉ"}
                  </Badge>

                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có học viên nào</p>
                  <p className="text-sm">Thêm học viên đầu tiên vào lớp học</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
