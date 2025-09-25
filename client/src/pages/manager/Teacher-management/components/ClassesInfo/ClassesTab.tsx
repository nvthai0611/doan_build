"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, GraduationCap, Users, Clock, Eye } from "lucide-react"

interface ClassesTabProps {
  employeeId: string
  activeTab: string
  search: string
  setActiveTab: (tab: string) => void
  setSearch: (search: string) => void
}

// Mock classes data
const getClassesData = (employeeId: string, status: string, search: string) => {
  const allClasses = [
    {
      id: 1,
      name: "Lớp Toán 12A1",
      subject: "Toán học",
      students: 25,
      schedule: "T2, T4, T6 - 19:00-21:00",
      status: "active",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      room: "Phòng 101",
      description: "Lớp học toán nâng cao cho học sinh lớp 12"
    },
    {
      id: 2,
      name: "Lớp Lý 11B2",
      subject: "Vật lý",
      students: 20,
      schedule: "T3, T5 - 18:00-20:00",
      status: "active",
      startDate: "2024-09-01",
      endDate: "2024-12-31",
      room: "Phòng 102",
      description: "Lớp học vật lý cơ bản cho học sinh lớp 11"
    },
    {
      id: 3,
      name: "Lớp Hóa 10C1",
      subject: "Hóa học",
      students: 18,
      schedule: "T2, T6 - 17:00-19:00",
      status: "completed",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      room: "Phòng 103",
      description: "Lớp học hóa học cho học sinh lớp 10"
    },
    {
      id: 4,
      name: "Lớp Toán 9D1",
      subject: "Toán học",
      students: 22,
      schedule: "T3, T7 - 19:30-21:30",
      status: "pending",
      startDate: "2024-10-01",
      endDate: "2025-01-31",
      room: "Phòng 104",
      description: "Lớp học toán cho học sinh lớp 9"
    }
  ]

  let filteredClasses = allClasses

  // Filter by status
  if (status !== "all") {
    filteredClasses = filteredClasses.filter(cls => cls.status === status)
  }

  // Filter by search
  if (search) {
    filteredClasses = filteredClasses.filter(cls =>
      cls.name.toLowerCase().includes(search.toLowerCase()) ||
      cls.subject.toLowerCase().includes(search.toLowerCase()) ||
      cls.room.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filteredClasses
}

export default function ClassesTab({
  employeeId,
  activeTab,
  search,
  setActiveTab,
  setSearch
}: ClassesTabProps) {
  const classes = getClassesData(employeeId, activeTab, search)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge>
      case "completed":
        return <Badge variant="secondary">Đã kết thúc</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ bắt đầu</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Lớp học</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm lớp học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="completed">Đã kết thúc</SelectItem>
                <SelectItem value="pending">Chờ bắt đầu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng số lớp</p>
                <p className="text-2xl font-bold text-blue-900">{classes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tổng học sinh</p>
                <p className="text-2xl font-bold text-green-900">
                  {classes.reduce((sum, cls) => sum + cls.students, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Lớp đang hoạt động</p>
                <p className="text-2xl font-bold text-orange-900">
                  {classes.filter(cls => cls.status === "active").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách lớp học</h3>
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có lớp học nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lớp</TableHead>
                  <TableHead>Môn học</TableHead>
                  <TableHead>Số học sinh</TableHead>
                  <TableHead>Lịch học</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.subject}</TableCell>
                    <TableCell>{cls.students}</TableCell>
                    <TableCell>{cls.schedule}</TableCell>
                    <TableCell>{cls.room}</TableCell>
                    <TableCell>{getStatusBadge(cls.status)}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}
