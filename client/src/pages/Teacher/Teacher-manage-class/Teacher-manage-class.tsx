"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MoreHorizontal, Plus, Filter, Eye, Edit, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getClassByTeacherId } from "../../../services/teacher-service/manage-class.service"
import { ApiResponse } from "../../../types/response"

const statusTabs = [
  { key: "all", label: "Tất cả", count: 1 },
  { key: "ongoing", label: "Đang diễn ra", count: 0 },
  { key: "completed", label: "Đã kết thúc", count: 1 },
  { key: "upcoming", label: "Chưa diễn ra", count: 0 },
  { key: "not-updated", label: "Chưa cập nhật", count: 0 },
]

const fakeClassData = [
  {
    id: 1,
    className: "Hóa 6",
    classCode: "HOA6",
    schedule: [
      { day: "Thứ Tư", time: "18:00 → 19:30" },
      { day: "Thứ Bảy", time: "18:00 → 19:30" },
    ],
    course: "Sơ Cấp",
    courseCode: "SC",
    status: "Đã kết thúc",
    startDate: "26/07/2025",
    endDate: "30/07/2025",
    teachers: [
      { name: "Nguyễn Văn A", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Trần Thị B", avatar: "/placeholder.svg?height=32&width=32" },
    ],
    accountCount: 2,
  },
]

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState("all")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedSession, setSelectedSession] = useState("")
  const [listClass, setListClass] = useState<any[]>([])
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

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const responseDataClass = await getClassByTeacherId()
        const apiResponse: ApiResponse<any> = responseDataClass
        
        if (apiResponse.success) {
          setListClass(apiResponse.data || [])
        } else {
          console.error('API returned error:', apiResponse.message)
          setListClass([])
        }
      } catch (error) {
        console.error('Error fetching classes:', error)
        setListClass([])
      }
    }

    fetchClasses()
  }, [])
  console.log(listClass);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

        <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Lớp học
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-32 transition-all duration-200 hover:border-blue-300 focus:border-blue-500">
            <SelectValue placeholder="Thứ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="monday">Thứ Hai</SelectItem>
            <SelectItem value="tuesday">Thứ Ba</SelectItem>
            <SelectItem value="wednesday">Thứ Tư</SelectItem>
            <SelectItem value="thursday">Thứ Năm</SelectItem>
            <SelectItem value="friday">Thứ Sáu</SelectItem>
            <SelectItem value="saturday">Thứ Bảy</SelectItem>
            <SelectItem value="sunday">Chủ Nhật</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-32 transition-all duration-200 hover:border-blue-300 focus:border-blue-500">
            <SelectValue placeholder="Ca học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="morning">Sáng</SelectItem>
            <SelectItem value="afternoon">Chiều</SelectItem>
            <SelectItem value="evening">Tối</SelectItem>
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
          variant="outline"
          className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-transparent"
        >
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-border relative">
        <div className="flex relative">
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

      <div className="border rounded-lg transition-all duration-200 hover:shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">STT</TableHead>
              <TableHead>Tên lớp học</TableHead>
              <TableHead>Lịch học</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>
                Ngày bắt đầu
                <br />
                Ngày kết thúc
              </TableHead>
              {/* <TableHead>Giáo viên phụ trách</TableHead> */}
              <TableHead>Số học sinh trong lớp</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fakeClassData.map((classItem, index) => (
              <TableRow key={classItem.id} className="hover:bg-muted/50 transition-colors duration-200">
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer transition-colors duration-200">
                      {classItem.className}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {classItem.classCode}
                      <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-[10px]">📋</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {classItem.schedule.map((schedule, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>
                          {schedule.day}, {schedule.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{classItem.course}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {classItem.courseCode}
                      <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-[10px]">📋</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-700 hover:bg-red-200 transition-colors duration-200"
                  >
                    {classItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div>{classItem.startDate}</div>
                    <div>{classItem.endDate}</div>
                  </div>
                </TableCell>
                {/* <TableCell>
                  <div className="flex -space-x-2">
                    {classItem.teachers.map((teacher, idx) => (
                      <Avatar key={idx} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                        <AvatarFallback className="text-xs">{teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell> */}
                <TableCell><span className="font-medium">{classItem.accountCount}</span></TableCell>
                <TableCell >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0 hover:bg-muted transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors duration-200">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa lớp học
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
            <span className="text-sm text-muted-foreground">1-1 trong 1</span>
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
