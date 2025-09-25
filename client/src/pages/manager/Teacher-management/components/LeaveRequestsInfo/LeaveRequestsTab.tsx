"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Calendar, Eye, Check, X } from "lucide-react"

interface LeaveRequestsTabProps {
  employeeId: string
  activeTab: string
  fromDate: string
  toDate: string
  search: string
  setActiveTab: (tab: string) => void
  setFromDate: (date: string) => void
  setToDate: (date: string) => void
  setSearch: (search: string) => void
}

// Mock leave requests data
const getLeaveRequestsData = (employeeId: string, status: string, fromDate: string, toDate: string, search: string) => {
  const allRequests = [
    {
      id: 1,
      type: "Nghỉ phép",
      reason: "Nghỉ phép năm",
      startDate: "2024-09-15",
      endDate: "2024-09-17",
      days: 3,
      status: "approved",
      submittedDate: "2024-09-10",
      approvedBy: "Nguyễn Văn A",
      approvedDate: "2024-09-11",
      notes: "Đã duyệt"
    },
    {
      id: 2,
      type: "Nghỉ ốm",
      reason: "Bị cảm cúm",
      startDate: "2024-09-20",
      endDate: "2024-09-20",
      days: 1,
      status: "pending",
      submittedDate: "2024-09-19",
      approvedBy: null,
      approvedDate: null,
      notes: "Chờ duyệt"
    },
    {
      id: 3,
      type: "Nghỉ việc riêng",
      reason: "Đám cưới em gái",
      startDate: "2024-09-25",
      endDate: "2024-09-25",
      days: 1,
      status: "rejected",
      submittedDate: "2024-09-22",
      approvedBy: "Nguyễn Văn A",
      approvedDate: "2024-09-23",
      notes: "Không đủ lý do chính đáng"
    },
    {
      id: 4,
      type: "Nghỉ phép",
      reason: "Du lịch gia đình",
      startDate: "2024-10-01",
      endDate: "2024-10-03",
      days: 3,
      status: "pending",
      submittedDate: "2024-09-28",
      approvedBy: null,
      approvedDate: null,
      notes: "Chờ duyệt"
    }
  ]

  let filteredRequests = allRequests

  // Filter by status
  if (status !== "all") {
    filteredRequests = filteredRequests.filter(req => req.status === status)
  }

  // Filter by date range
  if (fromDate) {
    filteredRequests = filteredRequests.filter(req => req.startDate >= fromDate)
  }
  if (toDate) {
    filteredRequests = filteredRequests.filter(req => req.startDate <= toDate)
  }

  // Filter by search
  if (search) {
    filteredRequests = filteredRequests.filter(req =>
      req.type.toLowerCase().includes(search.toLowerCase()) ||
      req.reason.toLowerCase().includes(search.toLowerCase()) ||
      req.notes.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filteredRequests
}

export default function LeaveRequestsTab({
  employeeId,
  activeTab,
  fromDate,
  toDate,
  search,
  setActiveTab,
  setFromDate,
  setToDate,
  setSearch
}: LeaveRequestsTabProps) {
  const requests = getLeaveRequestsData(employeeId, activeTab, fromDate, toDate, search)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4 text-green-600" />
      case "rejected":
        return <X className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-yellow-600" />
    }
  }

  const totalDays = requests.reduce((sum, req) => sum + req.days, 0)
  const approvedDays = requests
    .filter(req => req.status === "approved")
    .reduce((sum, req) => sum + req.days, 0)
  const pendingRequests = requests.filter(req => req.status === "pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Đơn xin nghỉ</h2>
          <div className="flex items-center space-x-4">
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Tạo đơn mới
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-blue-900">{requests.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tổng ngày nghỉ</p>
                <p className="text-2xl font-bold text-green-900">{totalDays}</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-orange-900">{approvedDays}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách đơn xin nghỉ</h3>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có đơn xin nghỉ nào</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại nghỉ</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày kết thúc</TableHead>
                  <TableHead>Số ngày</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người duyệt</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.type}</TableCell>
                    <TableCell>{request.reason}</TableCell>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      {new Date(request.endDate).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>{request.days} ngày</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.approvedBy || (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </TableCell>
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
