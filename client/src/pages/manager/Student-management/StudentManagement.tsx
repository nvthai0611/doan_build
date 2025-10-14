"use client"

import { useState, useMemo, useCallback } from "react"
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
import { FilterPanel, type FilterOptions } from "./components/FilterPanel"
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
import { toast } from "sonner"
import { centerOwnerStudentService } from "../../../services/center-owner/student-management/student.service"
import { useQuery } from "@tanstack/react-query"

const fetchData = async (params: any) => {
  const resDataStudent = await centerOwnerStudentService.getStudents(params)
  return resDataStudent
}

const fetchDataSubject = async () => {
  const resDataSubject = await centerOwnerStudentService.getSubject()
  return resDataSubject
}

const fetchDataStatus = async () => {
  const resDataStatus = await centerOwnerStudentService.getCountByStatus()
  return resDataStatus
}

export default function StudentManagement() {
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({})
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("") // Actual search query for API
  const [selectedCourse, setSelectedCourse] = useState<string>("Tất cả khóa học")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [collectData, setCollectData] = useState<boolean>(true)
  const [filterState, setFilterState] = useState<FilterState>({})
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const tabs: Tab[] = [
    { key: "all", label: "Tất cả", count: 120 },
    { key: "dropped", label: "Chờ xếp lớp", count: 44 },
    { key: "no-schedule", label: "Chưa cập nhật lịch học", count: 30 },
    { key: "active", label: "Đang học", count: 26 },
    { key: "stopped", label: "Dừng học", count: 43 },
  ]

  const status: any = {
    active: "Đang học",
    completed: "Tốt nghiệp",
    dropped: "Dừng học",
  }

  // Use searchQuery (triggered by Enter) instead of searchTerm
  const { data, isLoading, isError } = useQuery({
    queryKey: ["students", { 
      searchTerm: searchQuery, 
      selectedCourse, 
      activeTab, 
      advancedFilters, 
      filterState, 
      currentPage, 
      itemsPerPage 
    }],
    queryFn: () => fetchData({ 
      search: searchQuery,
      status: activeTab === "all" ? undefined : activeTab,
      page: currentPage,
      limit: itemsPerPage,
      course: selectedCourse === "Tất cả khóa học" ? undefined : selectedCourse,
      ...advancedFilters,
      ...filterState
    }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
    enabled: true
  })


  const { data: subjectData, isLoading: isLoadingSubject, isError: isErrorSubject } = useQuery({
    queryKey: ["subjects"],
    queryFn: fetchDataSubject,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const { data: statusData, isLoading: isLoadingStatus, isError: isErrorStatus } = useQuery({
    queryKey: ["status"],
    queryFn: fetchDataStatus,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })
  // Get student data from API response with optional chaining
  const studentData = data?.students || []
  
  const filteredStudents = useMemo(() => {
    let filtered = studentData

    // Filter by selected course/subject
    if (selectedCourse && selectedCourse !== "Tất cả khóa học") {
      filtered = filtered?.filter((student: any) => 
        student?.enrollments?.some((enrollment: any) => 
          enrollment?.class?.subject?.id === selectedCourse ||
          enrollment?.class?.subject?.name === selectedCourse
        )
      )
    }

    // Advanced filters
    if (advancedFilters?.gender) {
      filtered = filtered?.filter((student: any) => student?.user?.gender === advancedFilters.gender)
    }

    if (advancedFilters?.accountStatus) {
      filtered = filtered?.filter((student: any) => student?.user?.isActive === (advancedFilters.accountStatus === "active"))
    }

    if (advancedFilters?.customerConnection) {
      filtered = filtered?.filter((student: any) => {
        if (advancedFilters.customerConnection === "linked") {
          return student?.user?.phone && student?.user?.phone?.length > 0
        } else if (advancedFilters.customerConnection === "not-linked") {
          return !student?.user?.phone || student?.user?.phone?.length === 0
        } else if (advancedFilters.customerConnection === "pending") {
          return student?.enrollments?.some((enrollment: any) => enrollment?.status === "active")
        }
        return true
      })
    }

    // Filter by birth month/year from filterState
    if (filterState?.birthMonth || filterState?.birthYear) {
      filtered = filtered?.filter((student: any) => {
        if (!student?.user?.birthDate) return false

        const birthDate = new Date(student.user.birthDate)
        const month = (birthDate.getMonth() + 1).toString()
        const year = birthDate.getFullYear().toString()

        if (filterState.birthMonth && filterState.birthMonth !== "Tháng sinh" && month !== filterState.birthMonth) return false
        if (filterState.birthYear && filterState.birthYear !== "Năm sinh" && year !== filterState.birthYear) return false

        return true
      })
    }

    return filtered || []
  }, [studentData, selectedCourse, advancedFilters, filterState])

  // Since pagination is handled by API, we don't need client-side pagination
  const paginatedStudents = filteredStudents

  // Get total pages from API response
  const totalPages = data?.pagination?.totalPages || 1
  const totalCount = data?.pagination?.totalCount || 0

  // Search input handler - only updates local state
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  // Handle Enter key press to trigger search
  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchQuery(searchTerm) // Set the actual search query
      setCurrentPage(1) // Reset to first page when searching
      console.log('Searching for:', searchTerm)
    }
  }, [searchTerm])

  // Handle search button click (optional)
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm)
    setCurrentPage(1)
    console.log('Searching for:', searchTerm)
  }, [searchTerm])

  const handleViewStudent = (studentId: string): void => {
    const student = studentData?.find((std: any) => std?.id === studentId)
    if (student) {
      toast.info(`Xem thông tin chi tiết của ${student?.user?.fullName}`)
    }
    console.log(`[v0] Viewing student ${studentId}`)
  }

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
    console.log(`Copied code: ${code}`)
  }

  const handleDownloadTemplate = (): void => {
    toast.info("Đang tải xuống mẫu học viên...")
  }

  const handleUploadFile = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        toast.info(`Đang tải lên file: ${file.name}`)
        console.log(`Uploading file: ${file.name}`)
      }
    }
    input.click()
  }

  const handleRefreshPage = (): void => {
    setSearchTerm("")
    setSearchQuery("")
    setSelectedCourse("Tất cả khóa học")
    setFilterState({})
    setAdvancedFilters({})
    setCurrentPage(1) 
    toast.success("Đã làm mới dữ liệu")
  }

  const handleDownloadAll = (): void => {
    toast.info("Đang tải xuống tất cả dữ liệu học viên...")
    console.log("Downloading all student data")
  }

  const handleInviteStudent = (): void => {
    toast.info("Mở form mời học viên...")
    console.log("Opening invite student form")
  }

  const handleAddStudent = (): void => {
    toast.info("Mở form thêm học viên mới...")
    console.log("Opening add student form")
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
    setCurrentPage(1)
    console.log("Advanced filters changed:", filters)
  }

  const handleToggleFilter = () => {
    setFilterOpen(!filterOpen)
  }

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey)
    setCurrentPage(1)
  }

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course)
    setCurrentPage(1)
  }

  const handleMonthChange = (month: string) => {
    setFilterState(prev => ({ ...prev, birthMonth: month }))
    setCurrentPage(1)
  }

  const handleYearChange = (year: string) => {
    setFilterState(prev => ({ ...prev, birthYear: year }))
    setCurrentPage(1)
  }

  const getTabCount = (tabKey: string): number => {
    if (tabKey === "all") return totalCount

    const statusMap: Record<string, string[]> = {
      pending: ["active"],
      "no-schedule": ["active"],
      upcoming: ["active"],
      active: ["active"],
      reserved: ["withdrawn"],
      stopped: ["withdrawn"],
      graduated: ["completed"],
    }

    if (statusMap[tabKey]) {
      return studentData?.filter((student: any) => 
        student?.enrollments?.some((enrollment: any) => 
          statusMap[tabKey]?.includes(enrollment?.status)
        )
      )?.length || 0
    }

    return 0
  }

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-emerald-100 text-emerald-800"
      case "dropped":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800"
    }
  }

  const formatCurrency = (amount: number): string => {
    if (amount === 0) return "0 đ"
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ"
  }

  const getStudentStatus = (student: any): string => {
    const activeEnrollment = student?.enrollments?.find((e: any) => e?.status === "active")
    if (activeEnrollment) return "Đang học"
    
    const completedEnrollment = student?.enrollments?.find((e: any) => e?.status === "completed")
    if (completedEnrollment) return "Tốt nghiệp"
    
    const withdrawnEnrollment = student?.enrollments?.find((e: any) => e?.status === "withdrawn")
    if (withdrawnEnrollment) return "Dừng học"
    
    return "Chờ xếp lớp"
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu học viên...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    )
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
            <Select value={selectedCourse} onValueChange={handleCourseChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tất cả khóa học">Tất cả khóa học</SelectItem>
                {subjectData?.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState?.birthMonth || "Tháng sinh"} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tháng sinh">Tháng sinh</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    Tháng {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState?.birthYear || "Năm sinh"} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Năm sinh">Năm sinh</SelectItem>
                {Array.from({ length: 25 }, (_, i) => 2000 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, mã hoặc thông tin liên hệ (nhấn Enter để tìm)"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-12"
              />
              {/* Optional search button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchSubmit}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </Button>
              
              {/* Show indicator if search query differs from input */}
              {searchTerm !== searchQuery && searchQuery && (
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                  Đang hiển thị kết quả cho: "{searchQuery}"
                </div>
              )}
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
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
              {paginatedStudents?.map((student: any, index: number) => (
                <tr key={student?.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
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
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{student?.user?.fullName || "N/A"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{student?.user?.email || "N/A"}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>{student?.studentCode || "N/A"}</span>
                          <Copy
                            className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                            onClick={() => handleCopyCode(student?.studentCode || "")}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {student?.user?.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="w-3 h-3" />
                          {student.user.phone}
                        </div>
                      )}
                      {!student?.user?.phone && <div className="text-sm text-gray-400">-</div>}
                      {student?.user?.birthDate && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="w-3 h-3" />
                          {new Date(student.user.birthDate).toLocaleDateString('vi-VN')} - {student?.user?.gender || "N/A"}
                        </div>
                      )}
                      {!student?.user?.birthDate && <div className="text-sm text-gray-600 dark:text-gray-300">{student?.user?.gender || "N/A"}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {student?.enrollments?.map((enrollment: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className={getStatusBadgeColor(enrollment?.status)}>
                          {status[enrollment?.status] || "N/A"}
                        </Badge>
                      ))}
                      {(!student?.enrollments || student?.enrollments?.length === 0) && (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                          Chưa có lớp
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student?.enrollments?.map((enrollment: any) => enrollment?.class?.subject?.name)?.join(", ") || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {student?.enrollments?.map((enrollment: any) => enrollment?.class?.name)?.join(", ") || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => handleViewStudent(student?.id)}>
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
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)}{" "}
                trong {totalCount}
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
