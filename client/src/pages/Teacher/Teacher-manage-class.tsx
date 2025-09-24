"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MoreHorizontal, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

const statusTabs = [
  { key: "all", label: "Tất cả", count: 0 },
  { key: "ongoing", label: "Đang diễn ra", count: 0 },
  { key: "completed", label: "Đã kết thúc", count: 0 },
  { key: "upcoming", label: "Chưa diễn ra", count: 0 },
  { key: "not-updated", label: "Chưa cập nhật", count: 0 },
]

export default function TeacherManageClass() {
  const [activeTab, setActiveTab] = useState("completed")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCourse, setSelectedCourse] = useState("")

  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 })
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      const { offsetWidth, offsetLeft } = activeTabElement
      setUnderlineStyle({
        width: offsetWidth,
        left: offsetLeft,
      })
    }
  }, [activeTab])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Danh sách lớp học</h1>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Dashboard</span>
          <span>•</span>
          <span className="hover:text-foreground cursor-pointer transition-colors duration-200">Tài khoản</span>
          <span>•</span>
          <span className="text-foreground">Danh sách lớp học</span>
        </nav>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-border relative">
        <div className="flex space-x-8 relative">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[tab.key] = el)}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 relative transition-all duration-300 ease-out transform hover:scale-105 ${
                activeTab === tab.key ? "text-gray-900 font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="transition-all duration-200">{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-700"
                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          <div
            className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
            style={{
              width: `${underlineStyle.width}px`,
              left: `${underlineStyle.left}px`,
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-48 transition-all duration-200 hover:border-blue-300 focus:border-blue-500">
            <SelectValue placeholder="Khóa học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả khóa học</SelectItem>
            <SelectItem value="course1">Khóa học 1</SelectItem>
            <SelectItem value="course2">Khóa học 2</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp học"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg transition-all duration-200 hover:shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">STT</TableHead>
              <TableHead>Mã lớp học</TableHead>
              <TableHead>Tên lớp</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Khai giảng</TableHead>
              <TableHead>Học viên đang học</TableHead>
              <TableHead>Tiến độ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={7} className="h-64">
                <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground animate-in fade-in duration-500">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-muted/80">
                    <FileText className="w-8 h-8 transition-transform duration-200 hover:scale-110" />
                  </div>
                  <p className="text-sm">Không có dữ liệu</p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Switch
            id="collapse-mode"
            checked={isCollapsed}
            onCheckedChange={setIsCollapsed}
            className="transition-all duration-200"
          />
          <label
            htmlFor="collapse-mode"
            className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
          >
            Thu gọn
          </label>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Số hàng mỗi trang:</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 transition-all duration-200 hover:border-blue-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">0-0 trong 0</span>
            <div className="flex space-x-1">
              <Button variant="outline" size="sm" disabled className="transition-all duration-200 bg-transparent">
                ‹
              </Button>
              <Button variant="outline" size="sm" disabled className="transition-all duration-200 bg-transparent">
                ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
