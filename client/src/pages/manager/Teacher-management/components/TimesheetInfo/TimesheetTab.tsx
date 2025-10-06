"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Calendar, Clock, Eye, Download } from "lucide-react"

interface TimesheetTabProps {
  teacherId: string
  activeTab: string
  fromDate: string
  toDate: string
  search: string
  setActiveTab: (tab: string) => void
  setFromDate: (date: string) => void
  setToDate: (date: string) => void
  setSearch: (search: string) => void
}

// Mock timesheet data
const getTimesheetData = (employeeId: string, status: string, fromDate: string, toDate: string, search: string) => {
  const allTimesheets = [
    {
      id: 1,
      date: "2024-09-01",
      checkIn: "08:00",
      checkOut: "17:00",
      totalHours: 8,
      status: "approved",
      notes: "Làm việc bình thường",
      classes: ["Lớp Toán 12A1", "Lớp Lý 11B2"]
    },
    {
      id: 2,
      date: "2024-09-02",
      checkIn: "08:30",
      checkOut: "17:30",
      totalHours: 8.5,
      status: "approved",
      notes: "Làm thêm giờ",
      classes: ["Lớp Hóa 10C1"]
    },
    {
      id: 3,
      date: "2024-09-03",
      checkIn: "08:00",
      checkOut: "16:00",
      totalHours: 7,
      status: "pending",
      notes: "Nghỉ sớm vì lý do cá nhân",
      classes: ["Lớp Toán 9D1"]
    },
    {
      id: 4,
      date: "2024-09-04",
      checkIn: "09:00",
      checkOut: "18:00",
      totalHours: 8,
      status: "rejected",
      notes: "Đi muộn không có lý do",
      classes: []
    }
  ]

  let filteredTimesheets = allTimesheets

  // Filter by status
  if (status !== "all") {
    filteredTimesheets = filteredTimesheets.filter(ts => ts.status === status)
  }

  // Filter by date range
  if (fromDate) {
    filteredTimesheets = filteredTimesheets.filter(ts => ts.date >= fromDate)
  }
  if (toDate) {
    filteredTimesheets = filteredTimesheets.filter(ts => ts.date <= toDate)
  }

  // Filter by search
  if (search) {
    filteredTimesheets = filteredTimesheets.filter(ts =>
      ts.notes.toLowerCase().includes(search.toLowerCase()) ||
      ts.classes.some(cls => cls.toLowerCase().includes(search.toLowerCase()))
    )
  }

  return filteredTimesheets
}

export default function TimesheetTab({
  teacherId,
  activeTab,
  fromDate,
  toDate,
  search,
  setActiveTab,
  setFromDate,
  setToDate,
  setSearch
}: TimesheetTabProps) {
  const timesheets = getTimesheetData(teacherId, activeTab, fromDate, toDate, search)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Đã duyệt</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalHours = timesheets.reduce((sum, ts) => sum + ts.totalHours, 0)
  const approvedHours = timesheets
    .filter(ts => ts.status === "approved")
    .reduce((sum, ts) => sum + ts.totalHours, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bảng công</h2>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Từ ngày"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            placeholder="Đến ngày"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng số ngày</p>
                <p className="text-2xl font-bold text-blue-900">{timesheets.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tổng giờ làm</p>
                <p className="text-2xl font-bold text-green-900">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Giờ đã duyệt</p>
                <p className="text-2xl font-bold text-orange-900">{approvedHours.toFixed(1)}h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timesheet Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết bảng công</h3>
          {timesheets.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có dữ liệu bảng công</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ vào</TableHead>
                  <TableHead>Giờ ra</TableHead>
                  <TableHead>Tổng giờ</TableHead>
                  <TableHead>Lớp dạy</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timesheets.map((timesheet) => (
                  <TableRow key={timesheet.id}>
                    <TableCell className="font-medium">
                      {new Date(timesheet.date).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{timesheet.checkIn}</TableCell>
                    <TableCell>{timesheet.checkOut}</TableCell>
                    <TableCell>{timesheet.totalHours}h</TableCell>
                    <TableCell>
                      {timesheet.classes.length > 0 ? (
                        <div className="space-y-1">
                          {timesheet.classes.map((cls, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cls}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Không có</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(timesheet.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{timesheet.notes}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem
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
