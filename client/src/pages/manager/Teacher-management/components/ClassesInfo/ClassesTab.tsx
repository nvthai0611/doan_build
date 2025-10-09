"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Search, RefreshCw } from "lucide-react"
import { DataTable, type Column } from "../../../../../components/common/Table/DataTable"
import { useState, useMemo, useEffect } from "react"
import { useTeacherClassesQuery } from "./useTeacherClassesQuery"
import { formatSchedule } from "../../../../../utils/format"
import { useNavigate } from "react-router-dom"
import { usePagination } from "../../../../../hooks/usePagination"

// API Response interfaces
interface ApiClassData {
  id: string
  name: string
  subject: string
  students: number
  schedule: {
    days: string[]
    endTime: string
    startTime: string
  }
  status: string
  startDate: string
  endDate: string
  room: string
  description: string
  teacherId: string
}

// Table Data interface
interface ClassData {
  id: string
  name: string
  subject: string
  students: number
  schedule: string[]
  status: string
  startDate: string
  endDate: string
  room: string
  description: string
  role: string
  roleStatus: string
  present: number
  late: number
  absent: number
}

interface ClassesInfoProps {
  teacherId: string
  activeTab: "all" | "teaching" | "stopped"
  search: string
  setActiveTab: (tab: "all" | "teaching" | "stopped") => void
  setSearch: (search: string) => void
}

function ClassesTab({ teacherId, activeTab, search, setActiveTab, setSearch }: ClassesInfoProps) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 2,
    totalItems: 0 
  })
  console.log(teacherId);
  
  // Debounce search term để giảm số lần gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      // Reset về trang 1 khi search thay đổi
      pagination.setCurrentPage(1)
    }, 500) // Delay 500ms

    return () => clearTimeout(timer)
  }, [search]) // Chỉ depend vào search, không depend vào debouncedSearch
  
  // Gọi API chỉ với status và pagination, không có search
  const { data: teacherClassesData, isLoading, isError, refetch } = useTeacherClassesQuery({
    teacherId: teacherId,
    status: activeTab,
    search: '', // Không gửi search lên API
    page: pagination.currentPage,
    limit: pagination.itemsPerPage
  })
  
  console.log(teacherClassesData);

 

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Chưa cập nhật"
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang dạy</Badge>
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Ngừng dạy</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Transform API data to table format
  const transformedData = useMemo(() => {
    if (!teacherClassesData?.data || !Array.isArray(teacherClassesData.data)) return []
    
    let filteredData = teacherClassesData.data

    // Filter by status tab
    if (activeTab !== 'all') {
      filteredData = filteredData.filter((item: ApiClassData) => {
        if (activeTab === 'teaching') return item.status === 'active'
        if (activeTab === 'stopped') return item.status === 'inactive'
        return true
      })
    }

    // Filter by search term (local filtering as backup)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      filteredData = filteredData.filter((item: ApiClassData) => 
        item.name.toLowerCase().includes(searchLower) ||
        item.subject.toLowerCase().includes(searchLower) ||
        item.room.toLowerCase().includes(searchLower)
      )
    }
    
    return filteredData.map((item: ApiClassData) => ({
      id: item.id,
      name: item.name,
      subject: item.subject,
      students: item.students,
      schedule: formatSchedule(item.schedule),
      status: item.status,
      startDate: item.startDate,
      endDate: item.endDate,
      room: item.room,
      description: item.description,
      role: "Giáo viên chính", // TODO: role mặc định
      roleStatus: item.status === 'active' ? 'Đang dạy' : 'Ngừng dạy',
      present: 0, // These would come from attendance data
      late: 0,
      absent: 0
    }))
  }, [teacherClassesData, activeTab, debouncedSearch])
  // Tab counts based on actual data (before filtering)
  const tabCounts = useMemo(() => {
    if (!teacherClassesData?.data || !Array.isArray(teacherClassesData.data)) return { all: 0, teaching: 0, stopped: 0 }
    console.log(teacherClassesData.data);
    const all = teacherClassesData.data.length
      const teaching = teacherClassesData.data.filter((item: ApiClassData) => item.status === 'active').length
    const stopped = teacherClassesData.data.filter((item: ApiClassData) => item.status === 'inactive').length
    return { all, teaching, stopped }
  }, [teacherClassesData])

  // Filtered counts for display
  const filteredCounts = useMemo(() => {
    const all = transformedData.length
    const teaching = transformedData.filter((item: ClassData) => item.status === 'active').length
    const stopped = transformedData.filter((item: ClassData) => item.status === 'inactive').length
    return { all, teaching, stopped }
  }, [transformedData])

  // Reset page when search or tab changes
  const handleTabChange = (tab: "all" | "teaching" | "stopped") => {
    setActiveTab(tab)
    pagination.setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    pagination.setCurrentPage(1)
  }

  const handleViewClass = (classId: string) => {
    navigate(`/center-qn/classes/${classId}`)
  }

  const columns: Column<ClassData>[] = [
    {
      key: "id",
      header: "STT",
      width: "80px",
      align: "center",
      render: (item, index) => <span className="text-gray-700">{index + 1}</span>,
    },
    {
      key: "name",
      header: "Tên lớp",
      width: "300px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-blue-600 font-medium hover:underline" onClick={() => handleViewClass(item.id)}>{item.name}</div>
          {item.schedule.map((time, idx) => (
            <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
              {time}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "students",
      header: "Số học sinh",
      width: "120px",
      align: "center",
      render: (item) => <div className="text-gray-900 dark:text-white font-medium">{item.students}</div>,
    },
    {
      key: "role",
      header: "Vai trò",
      width: "180px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-gray-700">{item.role}</div>
          {getStatusBadge(item.status)}
        </div>
      ),
    },
    {
      key: "room",
      header: "Phòng học",
      width: "180px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-gray-700">{item.room}</div>
        </div>
      ),
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
    {
      key: "present",
      header: "Có mặt",
      width: "100px",
      align: "center",
      render: (item) => <div className="text-gray-900 dark:text-white font-medium">{item.present}</div>,
    },
    {
      key: "late",
      header: "Đi muộn",
      width: "100px",
      align: "center",
      render: (item) => <div className="text-orange-500 font-medium">{item.late}</div>,
    },
    {
      key: "absent",
      header: "Nghỉ dạy",
      width: "100px",
      align: "center",
      render: (item) => <div className="text-orange-500 font-medium">{item.absent}</div>,
    },
  ]

  const tabs = [
    { key: "all" as const, label: "Tất cả", count: filteredCounts.all },
    { key: "teaching" as const, label: "Đang dạy", count: filteredCounts.teaching },
    { key: "stopped" as const, label: "Ngừng dạy", count: filteredCounts.stopped },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Danh sách lớp học đã tham gia giảng dạy</h1>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
              }`}
            >
              {tab.label}{" "}
              <span className={`ml-1 ${activeTab === tab.key ? "text-blue-600" : "text-gray-400"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp"
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
      </div>

        <DataTable
          data={transformedData}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={refetch}
          emptyMessage="Không có dữ liệu lớp học"
          hoverable={true}
          pagination={{
            currentPage: pagination.currentPage, // Always show page 1 for filtered data
            totalPages: pagination.totalPages, // No pagination for filtered data
            totalItems: transformedData.length,
            itemsPerPage: transformedData.length,
            onPageChange: pagination.setCurrentPage, // Disabled for filtered data
            onItemsPerPageChange: () => {}, // Disabled for filtered data
            showItemsPerPage: true,
            showPageInfo: true,
          }}
        />

      {/* Footer with toggle */}
      <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={isCollapsed} onCheckedChange={setIsCollapsed} className="data-[state=checked]:bg-blue-600" />
          <span className="text-sm text-gray-700">Thu gọn</span>
        </div>
      </div>
    </div>
  )
}

export default ClassesTab
