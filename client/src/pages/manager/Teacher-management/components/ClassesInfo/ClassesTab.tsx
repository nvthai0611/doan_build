"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Search } from "lucide-react"
import { DataTable, type Column } from "../../../../../components/common/Table/DataTable"
import { useState } from "react"
import { useTeacherClassesQuery } from "./useTeacherClassesQuery"

interface ClassData {
  id: number
  code: string
  status: string
  name: string
  schedule: string[]
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
  const [isCollapsed, setIsCollapsed] = useState(false)


  const { data, isLoading, isError, refetch } = useTeacherClassesQuery({
    teacherId: teacherId,
    status: activeTab,
    search,
    page: 1,
    limit: 10
  })
  
  console.log('API Response:', data);
  console.log('Loading:', isLoading);
  console.log('Error:', isError);
  console.log('TeacherId:', teacherId);
  
  // Sample data matching the image (fallback)
  const sampleData: ClassData[] = [
    {
      id: 1,
      code: "CCD-CAA82D3FA88B",
      status: "ongoing",
      name: "PA4-3.5-18h00-T. Nam",
      schedule: ["Thứ Ba 15:30 → 16:30", "Thứ Năm 16:30 → 17:30"],
      role: "Chưa cập nhật",
      roleStatus: "Đang dạy",
      present: 1,
      late: 0,
      absent: 0,
    },
  ]

  const columns: Column<ClassData>[] = [
    {
      key: "id",
      header: "STT",
      width: "80px",
      align: "center",
      render: (item) => <span className="text-gray-700">{item.id}</span>,
    },
    {
      key: "code",
      header: "Mã lớp học",
      width: "200px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-blue-600 font-medium">{item.code}</div>
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Đang diễn ra</Badge>
        </div>
      ),
    },
    {
      key: "name",
      header: "Tên lớp",
      width: "280px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-blue-600 font-medium">{item.name}</div>
          {item.schedule.map((time, idx) => (
            <div key={idx} className="text-xs text-gray-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
              {time}
            </div>
          ))}
        </div>
      ),
    },
    {
      key: "role",
      header: "Vai trò",
      width: "180px",
      render: (item) => (
        <div className="space-y-1">
          <div className="text-gray-700">{item.role}</div>
          <div className="text-green-600 text-sm">{item.roleStatus}</div>
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Ngày bắt đầu",
      width: "120px",
      align: "center",
      render: () => <div className="text-gray-700">Chưa cập nhật</div>,
    },
    {
      key: "present",
      header: "Có mặt",
      width: "100px",
      align: "center",
      render: (item) => <div className="text-gray-900 font-medium">{item.present}</div>,
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
    { key: "all" as const, label: "Tất cả", count: 1 },
    { key: "teaching" as const, label: "Đang dạy", count: 1 },
    { key: "stopped" as const, label: "Ngừng dạy", count: 0 },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Danh sách lớp học đã tham gia giảng dạy</h1>

        {/* Tabs */}
        <div className="flex items-center gap-6 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}{" "}
              <span className={`ml-1 ${activeTab === tab.key ? "text-blue-600" : "text-gray-400"}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data?.data || sampleData}
        columns={columns}
        rowKey="id"
        hoverable={true}
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          onPageChange: () => {},
          onItemsPerPageChange: () => {},
          showItemsPerPage: true,
          showPageInfo: true,
        }}
      />

      {/* Footer with toggle */}
      <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Switch checked={isCollapsed} onCheckedChange={setIsCollapsed} className="data-[state=checked]:bg-blue-600" />
          <span className="text-sm text-gray-700">Thu gọn</span>
        </div>
      </div>
    </div>
  )
}

export default ClassesTab
