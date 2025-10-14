"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, UserPlus, Mail, Phone } from "lucide-react"

interface TeachersInfoProps {
  classId: string
}

export default function TeachersInfo({ classId }: TeachersInfoProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data - sẽ được thay thế bằng data thật từ API
  const teachers = [
    {
      id: "1",
      name: "Nguyễn Thị Lan",
      email: "lan.nguyen@email.com",
      phone: "0123456789",
      avatar: "",
      role: "Giáo viên chính",
      specialization: "Tiếng Anh",
      experience: "5 năm",
      status: "active"
    },
    {
      id: "2",
      name: "Trần Văn Minh",
      email: "minh.tran@email.com",
      phone: "0987654321",
      avatar: "",
      role: "Trợ giảng",
      specialization: "Toán học",
      experience: "2 năm",
      status: "active"
    }
  ]

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Giáo viên</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý giáo viên phụ trách lớp học
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm giáo viên
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm giáo viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giáo viên ({filteredTeachers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={teacher.avatar} alt={teacher.name} />
                    <AvatarFallback className="bg-purple-100 text-purple-600 text-lg">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {teacher.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {teacher.email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {teacher.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      {teacher.role}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chuyên môn: {teacher.specialization}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Kinh nghiệm: {teacher.experience}
                    </p>
                  </div>

                  <Badge 
                    variant={teacher.status === "active" ? "default" : "secondary"}
                    className={teacher.status === "active" ? "bg-green-100 text-green-800" : ""}
                  >
                    {teacher.status === "active" ? "Đang dạy" : "Tạm nghỉ"}
                  </Badge>

                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500">
                  <UserPlus className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg font-medium">Không có giáo viên nào</p>
                  <p className="text-sm">Thêm giáo viên đầu tiên vào lớp học</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
