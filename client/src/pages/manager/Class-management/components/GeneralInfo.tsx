"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Edit, Clock, ExternalLink } from "lucide-react"

interface ClassData {
  id: string
  name: string
  code: string
  course: string
  room: string
  startDate: string
  endDate: string
  status: string
  description: string
  schedule: Array<{
    day: string
    time: string
  }>
}

interface GeneralInfoProps {
  classData: ClassData
}

export default function GeneralInfo({ classData }: GeneralInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [formData, setFormData] = useState({
    name: classData.name,
    code: classData.code,
    course: classData.course,
    room: classData.room,
    startDate: classData.startDate,
    endDate: classData.endDate,
    description: classData.description,
  })

  const handleSave = () => {
    // Logic lưu dữ liệu sẽ được thêm sau
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: classData.name,
      code: classData.code,
      course: classData.course,
      room: classData.room,
      startDate: classData.startDate,
      endDate: classData.endDate,
      description: classData.description,
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Chi tiết lớp học */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Chi tiết lớp học</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Clock className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-purple-600 hover:text-purple-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên lớp học
                </label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {classData.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mã lớp học
                </label>
                {isEditing ? (
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {classData.code}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày bắt đầu
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {classData.startDate || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phòng học
                </label>
                {isEditing ? (
                  <Input
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {classData.room}
                  </p>
                )}
              </div>
            </div>

            {/* Cột phải */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Khoá học
                </label>
                {isEditing ? (
                  <Input
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                    {classData.course}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ngày kết thúc
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {classData.endDate || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Trạng thái hoạt động:
                </label>
                <div className="mt-1">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    {classData.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mô tả
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                ) : (
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {classData.description || "Chưa có mô tả"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lịch học hàng tuần */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Lịch học hàng tuần
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingSchedule(!isEditingSchedule)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4 mr-1" />
                Chỉnh sửa
              </Button>
            </div>
            
            <div className="space-y-2">
              {classData.schedule.map((schedule, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-900 dark:text-white">
                    {schedule.day} {schedule.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons for editing */}
          {isEditing && (
            <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
              <Button onClick={handleSave}>
                Lưu thay đổi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Cards */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Thiết lập điểm tiêu chí buổi học
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Thiết lập điểm tiêu chí bài tập
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Thiết lập loại bài tập
              </CardTitle>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
