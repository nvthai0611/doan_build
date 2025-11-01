"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Search, RefreshCw } from "lucide-react"
import { DataTable, type Column } from "../../../../../components/common/Table/DataTable"
import { useState, useMemo, useEffect } from "react"
import { useTeacherClassesQuery } from "./useTeacherClassesQuery"
import { useNavigate } from "react-router-dom"
import { usePagination } from "../../../../../hooks/usePagination"
import { CodeDisplay } from "../../../../../components/common/CodeDisplay"
import { formatScheduleArray } from "../../../../../utils/format"
import { ClassStatus } from "../../../../../lib/constants"

interface ClassesInfoProps {
  teacherId: string
  activeTab: "all" | "ready" | "active" | "cancelled" | "completed" | "suspended"
  search: string
  setActiveTab: (tab: "all" | "ready" | "active" | "cancelled" | "completed" | "suspended") => void
  setSearch: (search: string) => void
}

function ClassesTab({ teacherId, activeTab, search, setActiveTab, setSearch }: ClassesInfoProps) {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0
  })

  const ensureScheduleArray = (schedule: any): Array<{ day: string; time: string }> => {
    if (Array.isArray(schedule)) {
      // Check if it's already array of objects
      if (schedule.length > 0 && typeof schedule[0] === 'object') {
        return schedule
      }
      // Convert string array to object array
      return schedule.map((item: any) => ({ day: '', time: item }))
    }
    return formatScheduleArray(schedule)
  }
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      pagination.setCurrentPage(1)
    }, 500) 

    return () => clearTimeout(timer)
  }, [search])
  
  // Gọi API với status, search và pagination
  const { data: teacherClassesData, isLoading, isError, refetch } = useTeacherClassesQuery({
    teacherId: teacherId,
    status: activeTab,
    search: debouncedSearch,
    page: pagination.currentPage,
    limit: pagination.itemsPerPage
  })
  
  const meta = (teacherClassesData as any)?.meta
  const totalItems = meta?.total || 0
  const totalPages = meta?.totalPages || 0
 

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Chưa cập nhật"
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Đang dạy</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Đã kết thúc</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Chưa diễn ra</Badge>
      case 'ready':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang tuyển sinh</Badge>
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Tạm dừng</Badge>
      case 'deleted':
        return <Badge className="bg-red-100 text-red-800">Đã xóa</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // Filter data (backend already formatted schedule as array of strings)
  const filteredData = useMemo(() => {
    if (!teacherClassesData?.data || !Array.isArray(teacherClassesData.data)) return []
    
    let data = teacherClassesData.data.map((item: any) => ({
      ...item,
      role: item.role || "Giáo viên chính", // Add default role if not present
      late: item.late || 0,
      absent: item.absent || 0
    }))

    // Filter by status tab (local filter as backup)
    if (activeTab !== 'all') {
        data = data.filter((item: any) => {
        if (activeTab === 'active') return item.status === ClassStatus.ACTIVE
        if (activeTab === 'cancelled') return item.status === ClassStatus.CANCELLED
        if (activeTab === 'completed') return item.status === ClassStatus.COMPLETED
        if (activeTab === 'ready') return item.status === ClassStatus.READY
        if (activeTab === 'suspended') return item.status === ClassStatus.SUSPENDED
        return true
      })
    }

    // Filter by search term (local filtering)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase()
      data = data.filter((item: any) => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.subject?.toLowerCase().includes(searchLower) ||
        item.code?.toLowerCase().includes(searchLower) ||
        item.room?.toLowerCase().includes(searchLower)
      )
    }
    
    return data
  }, [teacherClassesData, activeTab, debouncedSearch])

  // Tab counts based on filtered data
  const tabCounts = useMemo(() => {
    const all = filteredData.length
    const ready = filteredData.filter((item: any) => item.status === ClassStatus.READY).length
    const active = filteredData.filter((item: any) => item.status === ClassStatus.ACTIVE).length
    const cancelled = filteredData.filter((item: any) => item.status === ClassStatus.CANCELLED).length
    const completed = filteredData.filter((item: any) => item.status === ClassStatus.COMPLETED).length
    const suspended = filteredData.filter((item: any) => item.status === ClassStatus.SUSPENDED).length
    return { all, ready, active, cancelled, completed, suspended }
  }, [filteredData])

  const handleTabChange = (tab: "all" | "ready" | "active" | "cancelled" | "completed" | "suspended") => {
    setActiveTab(tab)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleViewClass = (classId: string) => {
    navigate(`/center-qn/classes/${classId}`)
  }

  const columns: Column<any>[] = [
    {
      key: "id",
      header: "STT",
      width: "10px",
      align: "center",
      render: (item, index) => <span className="text-gray-700">{index + 1}</span>,
    },
    {
      key: "code",
      header: "Mã lớp",
      width: "100px",
      render: (item) => (
        <>
          <div className="space-y-1">
            <CodeDisplay code={item.code} hiddenLength={4} />
            {getStatusBadge(item.status)}
          </div>
        </>
      ),
    },  
    {
      key: "name",
      header: "Tên lớp",
      width: "200px",
      render: (item) => {
        const scheduleArray = ensureScheduleArray(item.schedule)
        return (
          <div className="space-y-1">
            <div className="text-blue-600 font-medium hover:underline cursor-pointer" onClick={() => handleViewClass(item.id)}>{item.name}</div>
            {scheduleArray.map((scheduleItem: any, idx: number) => (
              <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                {typeof scheduleItem === 'string' ? scheduleItem : `${scheduleItem.day} ${scheduleItem.time}`}
              </div>
            ))}
          </div>
        )
      },
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
      width: "100px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-gray-700">{item.role}</div>
        </div>
      ),
    },
    {
      key: "room",
      header: "Phòng học",
      width: "100px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-gray-700">{item.room}</div>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu/Ngày kết thúc",
      width: "100px",
      align: "center",
      render: (item) => <div className="text-gray-700"><p>{formatDate(item.startDate)}</p> <p>{formatDate(item.endDate)}</p></div>,
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
    { key: "all" as const, label: "Tất cả", count: tabCounts.all },
    { key: "ready" as const, label: "Đang tuyển sinh", count: tabCounts.ready },
    { key: "active" as const, label: "Đang dạy", count: tabCounts.active },
    { key: "cancelled" as const, label: "Đã hủy", count: tabCounts.cancelled },
    { key: "completed" as const, label: "Đã kết thúc", count: tabCounts.completed },
    { key: "suspended" as const, label: "Tạm dừng", count: tabCounts.suspended },
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
          data={filteredData}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={refetch}
          emptyMessage="Không có dữ liệu lớp học"
          hoverable={true}
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalItems: filteredData.length,
            itemsPerPage: filteredData.length,
            onPageChange: () => {},
            onItemsPerPageChange: () => {},
            showItemsPerPage: false,
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
