"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DataTable, type Column } from "../../../../../components/common/Table/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Calendar, Eye, Check, X, RefreshCw } from "lucide-react"
import { useLeaveRequestsQuery } from "./useLeaveRequestsQuery"


// Utility functions
const formatDate = (dateString: string): string => {
  if (!dateString) return "Chưa cập nhật"
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const calculateDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const timeDiff = end.getTime() - start.getTime()
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1
}

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

export default function LeaveRequestsTab({
  teacherId,
  activeTab,
  fromDate,
  toDate,
  search,
  setActiveTab,
  setFromDate,
  setToDate,
  setSearch
}: any) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce search term để giảm số lần gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 500) // Delay 500ms

    return () => clearTimeout(timer)
  }, [search])

  // Gọi API với debounced search 
  const { data: leaveRequestsData, isLoading, isError, refetch } = useLeaveRequestsQuery({
    teacherId: teacherId,
    status: activeTab,
    search: debouncedSearch,
    fromDate: fromDate,
    toDate: toDate,
    page: currentPage,
    limit: itemsPerPage
  })


  // Transform API data
  const requests = useMemo(() => {
    if (!leaveRequestsData?.data || !Array.isArray(leaveRequestsData?.data)) return []
    return leaveRequestsData?.data
  }, [leaveRequestsData])

  // Calculate stats
  const stats = useMemo(() => {
    // const totalDays = requests.reduce((sum: number, req: any) => sum + calculateDays(req.startDate, req.endDate), 0)
    const pendingRequests = requests.filter((req: any) => req.status === "pending").length
    const approvedRequests = requests.filter((req: any) => req.status === "approved").length
    const totalRequests = requests.length

    return {
      // totalDays,
      pendingRequests,
      approvedRequests,
      totalRequests
    } 
  }, [requests])

  // Reset page when search or tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setFromDate(value)
    } else {
      setToDate(value)
    }
    setCurrentPage(1)
  }

  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: "type",
      header: "Loại nghỉ",
      width: "150px",
      render: (item) => <div className="font-medium">{item.type}</div>,
    },
    {
      key: "reason",
      header: "Lý do",
      width: "200px",
      render: (item) => <div className="text-gray-700">{item.reason}</div>,
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu",
      width: "120px",
      align: "center",
      render: (item) => <div className="text-gray-700">{formatDate(item.startDate)}</div>,
    },
    {
      key: "endDate",
      header: "Ngày kết thúc",
      width: "120px",
      align: "center",
      render: (item) => <div className="text-gray-700">{formatDate(item.endDate)}</div>,
    },
    // {
    //   key: "days",
    //   header: "Số ngày",
    //   width: "100px",
    //   align: "center",
    //   render: (item) => <div className="font-medium">{calculateDays(item.startDate, item.endDate)} ngày</div>,
    // },
    {
      key: "status",
      header: "Trạng thái",
      width: "150px",
      align: "center",
      render: (item) => (
        <div className="flex items-center justify-center space-x-2">
          {getStatusIcon(item.status)}
          {getStatusBadge(item.status)}
        </div>
      ),
    },
    {
      key: "approvedBy",
      header: "Người duyệt",
      width: "150px",
      align: "center",
      render: (item) => (
        <div className="text-gray-700">
          {item.approvedBy || <span className="text-gray-400">Chưa có</span>}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Đơn xin nghỉ</h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm theo loại nghỉ, lý do..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
            {/* Loading indicator khi đang debounce */}
            {search !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          <Select value={activeTab} onValueChange={handleTabChange}>
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
            onChange={(e) => handleDateChange('from', e.target.value)}
          />
          <Input
            type="date"
            placeholder="Đến ngày"
            value={toDate}
            onChange={(e) => handleDateChange('to', e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-blue-900">{stats?.totalRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-900">{stats?.pendingRequests}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Check className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Đã duyệt</p>
                <p className="text-2xl font-bold text-green-900">{stats?.approvedRequests}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Danh sách đơn xin nghỉ</h3>
          <DataTable
            data={requests}
            columns={columns}
            rowKey="id"
            hoverable={true}
            pagination={{
              currentPage: leaveRequestsData?.meta?.page || currentPage,
              totalPages: leaveRequestsData?.meta?.totalPages || 1,
              totalItems: leaveRequestsData?.meta?.total || requests?.length,
              itemsPerPage: leaveRequestsData?.meta?.limit || itemsPerPage,
              onPageChange: setCurrentPage,
              onItemsPerPageChange: setItemsPerPage,
              showItemsPerPage: true,
              showPageInfo: true,
            }}
          />
        </div>
      </div>
    </div>
  )
}
