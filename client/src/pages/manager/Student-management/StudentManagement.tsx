"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPanel, type FilterOptions } from "./components/filter-panel"
import {
  ChevronRight,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Copy,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react"
import type { Student, Tab, FilterState } from "./types/student"

// Mock data for students
const students: Student[] = [
  {
    id: 1,
    name: "Bùi Thị Hải Anh",
    email: "buithihaianh@centerup",
    phone: "012345678",
    username: "buithihaianh@centerup",
    code: "CST-C431CA00CC020",
    status: "Đang học",
    course: "0",
    class: "0",
    averageScore: 0,
    totalFee: 0,
    walletBalance: 0,
    gender: "Nữ",
  },
  {
    id: 2,
    name: "An",
    email: "phamamlink@centerup",
    phone: "",
    username: "phamamlink@centerup",
    code: "CST-67FB01271906",
    status: "Đang học",
    course: "1",
    class: "1",
    averageScore: 0,
    totalFee: 5850000,
    walletBalance: 0,
    gender: "Nam",
  },
  {
    id: 3,
    name: "Nguyễn Amslink",
    email: "amslink@gmail.com",
    phone: "",
    username: "amslink@centerup",
    code: "CST-FB09C1C8B816",
    status: "Chờ xếp lớp",
    course: "2",
    class: "1",
    averageScore: 0,
    totalFee: -3500000,
    walletBalance: 11236333.33,
    gender: "Nam",
  },
  {
    id: 4,
    name: "hackiem",
    email: "nguyencongthinh@gmail.com",
    phone: "0943838882",
    username: "hackiem@centerup",
    code: "CST-39166834E3C8",
    status: "Dừng học",
    course: "0",
    class: "0",
    averageScore: 0,
    totalFee: 0,
    walletBalance: 0,
    gender: "Khác",
  },
  {
    id: 5,
    name: "Võ Thị Hồng Nhung",
    email: "hongnhungvo23dn@gmail.com",
    phone: "0909999999",
    username: "hongnhung123@centerup",
    code: "CST-1622A0754D58",
    status: "Chưa cập nhật lịch học",
    course: "4",
    class: "4",
    averageScore: 6.5,
    totalFee: 6187500,
    walletBalance: 0,
    gender: "Nữ",
    birthDate: "21/08/2001",
  },
  {
    id: 6,
    name: "HVDara2",
    email: "hvdara2@gmail.com",
    phone: "",
    username: "hvdara2@centerup",
    code: "CST-B8B3A03C7E21",
    status: "Chờ xếp lớp",
    course: "2",
    class: "1",
    averageScore: 6.5,
    totalFee: 350000,
    walletBalance: -200000,
    gender: "Nam",
  },
  {
    id: 7,
    name: "HVdara1",
    email: "hvdara1@gmail.com",
    phone: "",
    username: "hvdara1@centerup",
    code: "CST-0425CD087A05",
    status: "Chưa cập nhật lịch học",
    course: "2",
    class: "2",
    averageScore: 0,
    totalFee: -900000,
    walletBalance: 40000000,
    gender: "Nam",
  },
]

export default function StudentManagement() {
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({})
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("Tất cả khóa học")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [collectData, setCollectData] = useState<boolean>(true)
  const [filterState, setFilterState] = useState<FilterState>({})
  const [studentData, setStudentData] = useState<Student[]>(students)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const tabs: Tab[] = [
    { key: "all", label: "Tất cả", count: 120 },
    { key: "pending", label: "Chờ xếp lớp", count: 44 },
    { key: "no-schedule", label: "Chưa cập nhật lịch học", count: 30 },
    { key: "upcoming", label: "Sắp học", count: 1 },
    { key: "active", label: "Đang học", count: 26 },
    { key: "reserved", label: "Bảo lưu", count: 0 },
    { key: "stopped", label: "Dừng học", count: 43 },
    { key: "graduated", label: "Tốt nghiệp", count: 2 },
  ]

  const filteredStudents = useMemo(() => {
    let filtered = studentData

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone.includes(searchTerm) ||
          student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCourse !== "Tất cả khóa học") {
      filtered = filtered.filter((student) => student.course === selectedCourse)
    }

    if (activeTab !== "all") {
      const statusMap: Record<string, Student["status"][]> = {
        pending: ["Chờ xếp lớp"],
        "no-schedule": ["Chưa cập nhật lịch học"],
        upcoming: ["Sắp học"],
        active: ["Đang học"],
        reserved: ["Bảo lưu"],
        stopped: ["Dừng học"],
        graduated: ["Tốt nghiệp"],
      }

      if (statusMap[activeTab]) {
        filtered = filtered.filter((student) => statusMap[activeTab].includes(student.status))
      }
    }

    if (advancedFilters.gender) {
      filtered = filtered.filter((student) => student.gender === advancedFilters.gender)
    }

    if (advancedFilters.accountStatus) {
      filtered = filtered.filter((student) => student.status === advancedFilters.accountStatus)
    }

    if (advancedFilters.customerConnection) {
      filtered = filtered.filter((student) => {
        if (advancedFilters.customerConnection === "linked") {
          return student.phone && student.phone.length > 0
        } else if (advancedFilters.customerConnection === "not-linked") {
          return !student.phone || student.phone.length === 0
        } else if (advancedFilters.customerConnection === "pending") {
          return student.status === "Chờ xếp lớp"
        }
        return true
      })
    }

    if (filterState.birthDate || filterState.birthMonth || filterState.birthYear) {
      filtered = filtered.filter((student) => {
        if (!student.birthDate) return false

        const [day, month, year] = student.birthDate.split("/")

        if (filterState.birthDate && day !== filterState.birthDate) return false
        if (filterState.birthMonth && month !== filterState.birthMonth) return false
        if (filterState.birthYear && year !== filterState.birthYear) return false

        return true
      })
    }

    return filtered
  }, [studentData, searchTerm, selectedCourse, activeTab, filterState, advancedFilters])

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredStudents, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

  const handleViewStudent = (studentId: number): void => {
    const student = studentData.find((std) => std.id === studentId)
    if (student) {
      alert(`Xem thông tin chi tiết của ${student.name}`)
    }
    console.log(`[v0] Viewing student ${studentId}`)
  }

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code)
    alert(`Đã sao chép mã: ${code}`)
    console.log(`[v0] Copied code: ${code}`)
  }

  const handleDownloadTemplate = (): void => {
    alert("Đang tải xuống mẫu học viên...")
    console.log("[v0] Downloading student template")
  }

  const handleUploadFile = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        alert(`Đang tải lên file: ${file.name}`)
        console.log(`[v0] Uploading file: ${file.name}`)
      }
    }
    input.click()
  }

  const handleRefreshPage = (): void => {
    setSearchTerm("")
    setSelectedCourse("Tất cả khóa học")
    setFilterState({})
    setAdvancedFilters({})
    setCurrentPage(1)
    alert("Đã làm mới dữ liệu")
    console.log("[v0] Refreshed page data")
  }

  const handleDownloadAll = (): void => {
    alert("Đang tải xuống tất cả dữ liệu học viên...")
    console.log("[v0] Downloading all student data")
  }

  const handleInviteStudent = (): void => {
    alert("Mở form mời học viên...")
    console.log("[v0] Opening invite student form")
  }

  const handleAddStudent = (): void => {
    alert("Mở form thêm học viên mới...")
    console.log("[v0] Opening add student form")
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string): void => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  const handleAdvancedFilterChange = (filters: FilterOptions) => {
    setAdvancedFilters(filters)
    console.log("[v0] Advanced filters changed:", filters)
  }

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen)
  }

  const getTabCount = (tabKey: string): number => {
    if (tabKey === "all") return studentData.length

    const statusMap: Record<string, Student["status"][]> = {
      pending: ["Chờ xếp lớp"],
      "no-schedule": ["Chưa cập nhật lịch học"],
      upcoming: ["Sắp học"],
      active: ["Đang học"],
      reserved: ["Bảo lưu"],
      stopped: ["Dừng học"],
      graduated: ["Tốt nghiệp"],
    }

    if (statusMap[tabKey]) {
      return studentData.filter((student) => statusMap[tabKey].includes(student.status)).length
    }

    return 0
  }

  const getStatusBadgeColor = (status: Student["status"]): string => {
    switch (status) {
      case "Đang học":
        return "bg-green-100 text-green-800"
      case "Chờ xếp lớp":
        return "bg-yellow-100 text-yellow-800"
      case "Dừng học":
        return "bg-red-100 text-red-800"
      case "Chưa cập nhật lịch học":
        return "bg-orange-100 text-orange-800"
      case "Sắp học":
        return "bg-blue-100 text-blue-800"
      case "Bảo lưu":
        return "bg-purple-100 text-purple-800"
      case "Tốt nghiệp":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800"
    }
  }

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "0 đ"
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ"
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Danh sách tài khoản học viên</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Danh sách tài khoản học viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-white border-blue-600 bg-blue-600 hover:bg-blue-50"
              onClick={handleAddStudent}
            >
              <Plus className="w-4 h-4 mr-2" />
              Tài khoản học viên
            </Button>
            <Button variant="outline" className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800" onClick={handleInviteStudent}>
              Mời tài khoản học viên
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tất cả khóa học">Tất cả khóa học</SelectItem>
                <SelectItem value="0">Khóa học 0</SelectItem>
                <SelectItem value="1">Khóa học 1</SelectItem>
                <SelectItem value="2">Khóa học 2</SelectItem>
                <SelectItem value="4">Khóa học 4</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="Tháng sinh">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tháng sinh">Tháng sinh</SelectItem>
                <SelectItem value="1">Tháng 1</SelectItem>
                <SelectItem value="2">Tháng 2</SelectItem>
                <SelectItem value="3">Tháng 3</SelectItem>
                <SelectItem value="4">Tháng 4</SelectItem>
                <SelectItem value="5">Tháng 5</SelectItem>
                <SelectItem value="6">Tháng 6</SelectItem>
                <SelectItem value="7">Tháng 7</SelectItem>
                <SelectItem value="8">Tháng 8</SelectItem>
                <SelectItem value="9">Tháng 9</SelectItem>
                <SelectItem value="10">Tháng 10</SelectItem>
                <SelectItem value="11">Tháng 11</SelectItem>
                <SelectItem value="12">Tháng 12</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="Năm sinh">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Năm sinh">Năm sinh</SelectItem>
                <SelectItem value="2001">2001</SelectItem>
                <SelectItem value="2002">2002</SelectItem>
                <SelectItem value="2003">2003</SelectItem>
                <SelectItem value="2004">2004</SelectItem>
                <SelectItem value="2005">2005</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, mã hoặc thông tin liên hệ"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            <Button variant="outline" className="gap-2 bg-white dark:bg-gray-800" onClick={handleToggleFilter}>
              <Filter className="w-4 h-4" />
              Bộ lọc
            </Button>

            <FilterPanel
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              onFilterChange={handleAdvancedFilterChange}
              currentFilters={advancedFilters}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4" />
                  Tải mẫu
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleUploadFile}>
                  <Upload className="w-4 h-4" />
                  Tải lên
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleRefreshPage}>
                  <RefreshCw className="w-4 h-4" />
                  Tải lại trang
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={handleDownloadAll}>
                  <Download className="w-4 h-4" />
                  Tải tất cả
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                }`}
              >
                {tab.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{getTabCount(tab.key)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tài khoản học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Thông tin liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lớp học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Điểm trung bình
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tổng số dư học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Số dư ví
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {paginatedStudents.map((student: Student, index: number) => (
                <tr key={student.id} className="hover:bg-gray-50 dark:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full"></div>
                          </div>
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.username}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>{student.code}</span>
                          <Copy
                            className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:text-gray-300"
                            onClick={() => handleCopyCode(student.code)}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {student.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-3 h-3" />
                          {student.phone}
                        </div>
                      )}
                      {!student.phone && <div className="text-sm text-gray-400">-</div>}
                      {student.birthDate && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {student.birthDate} - {student.gender}
                        </div>
                      )}
                      {!student.birthDate && <div className="text-sm text-gray-600 dark:text-gray-300">{student.gender}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <Badge variant="secondary" className={getStatusBadgeColor(student.status)}>
                        {student.status}
                      </Badge>
                      {student.status === "Chờ xếp lớp" && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                          Chờ xếp lớp (1)
                        </Badge>
                      )}
                      {student.status === "Dừng học" && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                          Dừng học (1)
                        </Badge>
                      )}
                      {student.status === "Chưa cập nhật lịch học" && (
                        <div className="space-y-1">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
                            Chưa cập nhật lịch học (1)
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                            Đang học (2)
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                            Dừng học (1)
                          </Badge>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student.averageScore > 0 ? `${student.averageScore}/10` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={
                        student.totalFee < 0
                          ? "text-red-600"
                          : student.totalFee > 0
                            ? "text-green-600"
                            : "text-gray-900 dark:text-white"
                      }
                    >
                      {formatCurrency(student.totalFee)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={
                        student.walletBalance < 0
                          ? "text-red-600"
                          : student.walletBalance > 0
                            ? "text-green-600"
                            : "text-gray-900 dark:text-white"
                      }
                    >
                      {formatCurrency(student.walletBalance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleViewStudent(student.id)}>
                          <Eye className="w-4 h-4" />
                          Xem
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={collectData} onCheckedChange={setCollectData} />
                <span className="text-sm text-gray-600 dark:text-gray-300">Thu gọn</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Số hàng mỗi trang:</span>
                <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredStudents.length)}{" "}
                trong {filteredStudents.length}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
