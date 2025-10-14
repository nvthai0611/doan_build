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
import { DataTable } from "../../../components/common/Table/DataTable"
import { StudentDetailModal } from "./components/student-detail-modal"
import { CreateStudentModal } from "./components/CreateStudentModal"
import { useNavigate } from "react-router-dom"
import { useUpdateStudentStatus, useToggleStudentStatus } from "./hooks/useStudents"

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
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  const tabs: Tab[] = [
    { key: "all", label: "Tất cả", count: 120 },
    { key: "active", label: "Đang học", count: 26 },
    { key: "dropped", label: "Chờ xếp lớp", count: 44 },
    { key: "no-schedule", label: "Chưa cập nhật lịch học", count: 30 },
    { key: "completed", label: "Hoàn thành", count: 44 },
    { key: "stopped", label: "Dừng học", count: 43 },
  ]
  const navigate = useNavigate()
  
  // Mutations for status change
  const updateStudentStatusMutation = useUpdateStudentStatus()
  const toggleStudentStatusMutation = useToggleStudentStatus()

  const status: any = {
    active: "Đang học",
    completed: "Hoàn thành",
    dropped: "Dừng học",
  }

  const gender: any ={
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác"
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

        if (filterState.birthMonth && filterState.birthMonth !== "all" && month !== filterState.birthMonth) return false
        if (filterState.birthYear && filterState.birthYear !== "all" && year !== filterState.birthYear) return false

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
    }
  }, [searchTerm])

  // Handle search button click (optional)
  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm)
    setCurrentPage(1)
  }, [searchTerm])

  const handleViewStudent = (studentId: string): void => {
    setSelectedStudentId(studentId)
    setIsModalOpen(true)
  }

  const handleCloseModal = (): void => {
    setIsModalOpen(false)
    setSelectedStudentId(null)
  }

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
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
      }
    }
    input.click()
  }

  const handleRefreshPage = (): void => {
    // Reset tất cả về giá trị mặc định
    setSearchTerm("")
    setSearchQuery("")
    setSelectedCourse("Tất cả khóa học")
    setFilterState({
      birthMonth: undefined,
      birthYear: undefined
    })
    setAdvancedFilters({
      gender: undefined,
      accountStatus: undefined,
      customerConnection: undefined
    })
    setActiveTab("all")
    setCurrentPage(1)
    setItemsPerPage(10)
    
    // Close filter panel if open
    setFilterOpen(false)
    
    toast.success("Đã làm mới tất cả bộ lọc")
  }

  // Thêm hàm handleClearAllFilters để dùng chung cho cả refresh và clear filters
  const handleClearAllFilters = (): void => {
    // Reset tất cả state về giá trị mặc định
    setSearchTerm("")
    setSearchQuery("")
    setSelectedCourse("Tất cả khóa học") 
    setFilterState({})
    setAdvancedFilters({})
    setActiveTab("all")
    setCurrentPage(1)
    setItemsPerPage(10)
    
    // Close filter panel
    setFilterOpen(false)
    
  }

  const handleDownloadAll = (): void => {
    toast.info("Đang tải xuống tất cả dữ liệu học viên...")
  }

  const handleInviteStudent = (): void => {
    toast.info("Mở form mời học viên...")
  }

  const handleAddStudent = (): void => {
    setIsCreateModalOpen(true)
  }

  const handleCreateStudentSuccess = (): void => {
    // Refresh data after successful creation
    // The modal will handle query invalidation via TanStack Query
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
    setFilterState(prev => ({ ...prev, birthMonth: month != "all" ? month : undefined }))
    setCurrentPage(1)
  }

  const handleYearChange = (year: string) => {
    setFilterState(prev => ({ ...prev, birthYear: year != "all" ? year : undefined }))
    setCurrentPage(1)
  }

  // Handle status change functions
  const handleToggleAccountStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      await updateStudentStatusMutation.mutateAsync({
        studentId,
        isActive: !currentStatus
      })
    } catch (error) {
      console.error('Error toggling account status:', error)
    }
  }

  const handleChangeAccountStatus = async (studentId: string, isActive: boolean) => {
    try {
      await updateStudentStatusMutation.mutateAsync({
        studentId,
        isActive
      })
    } catch (error) {
      console.error('Error changing account status:', error)
    }
  }

  const getTabCount = (tabKey: string): number => {
    if (tabKey === "all") return statusData?.total  
    const findCountByKey = statusData?.counts?.[tabKey] || 0

    return findCountByKey ? findCountByKey : 0
  }

  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300"
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

  // Define columns for DataTable
  const columns = useMemo(() => [
    // STT Column
    {
      key: "stt",
      header: "STT",
      width: "80px",
      render: (student: any, index: number) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      )
    },
    // Student Account Column
    {
      key: "account",
      header: "Tài khoản học viên",
      width: "300px",
      render: (student: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-200">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full"></div>
              </div>
            </AvatarFallback>
          </Avatar>
          <div>
            <div onClick={() => navigate(`/center-qn/students/${student?.id}`)} className="text-sm font-medium dark:text-white text-blue-600">
              {student?.user?.fullName || "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {student?.user?.email || "N/A"}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{student?.studentCode || "N/A"}</span>
              <Copy
                className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => handleCopyCode(student?.studentCode || "")}
              />
            </div>
          </div>
        </div>
      )
    },
    // Contact Info Column
    {
      key: "contact",
      header: "Thông tin liên hệ",
      width: "250px",
      render: (student: any) => (
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
              {new Date(student.user.birthDate).toLocaleDateString('vi-VN')} - {gender[student?.user?.gender] || "N/A"}
            </div>
          )}
          {!student?.user?.birthDate && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {gender[student?.user?.gender] || "N/A"}
            </div>
          )}
        </div>
      )
    },
    // Status Column
    {
      key: "status",
      header: "Trạng thái",
      width: "200px",
      render: (student: any) => (
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
      )
    },
    // Course Column
    {
      key: "course",
      header: "Khóa học",
      width: "200px",
      render: (student: any) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {student?.enrollments?.map((enrollment: any) => enrollment?.class?.subject?.name)?.join(", ") || "-"}
        </span>
      )
    },
    // Class Column
    {
      key: "class",
      header: "Lớp học",
      width: "200px",
      render: (student: any) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {student?.enrollments?.map((enrollment: any) => enrollment?.class?.name)?.join(", ") || "-"}
        </span>
      )
    },
    // Account Status Column (moved to last)
    {
      key: "accountStatus",
      header: "Tài khoản",
      width: "250px",
      align: "right" as const,
      render: (student: any) => (
        <div className="flex items-center justify-end gap-3">
          <Switch
            checked={student?.user?.isActive || false}
            onCheckedChange={() => handleToggleAccountStatus(student?.id, student?.user?.isActive)}
            disabled={updateStudentStatusMutation.isPending}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`text-sm font-medium ${
            student?.user?.isActive 
              ? "text-green-700 dark:text-green-400" 
              : "text-red-700 dark:text-red-400"
          }`}>
            {student?.user?.isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </span>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => handleChangeAccountStatus(student?.id, !student?.user?.isActive)}
            disabled={updateStudentStatusMutation.isPending}
            className={`text-xs px-3 py-1 ml-2 ${
              student?.user?.isActive
                ? "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                : "text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            }`}
          >
            {student?.user?.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          </Button> */}
        </div>
      )
    }
  ], [currentPage, itemsPerPage, status, handleCopyCode, handleViewStudent, getStatusBadgeColor, handleToggleAccountStatus, handleChangeAccountStatus, updateStudentStatusMutation.isPending])

  // Pagination config for DataTable
  const paginationConfig = useMemo(() => ({
    currentPage,
    totalPages,
    totalItems: totalCount,
    itemsPerPage,
    onPageChange: handlePageChange,
    onItemsPerPageChange: (value: number) => {
      setItemsPerPage(value)
      setCurrentPage(1)
    },
    showItemsPerPage: true,
    showPageInfo: true
  }), [currentPage, totalPages, totalCount, itemsPerPage, handlePageChange])

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
                  <BreadcrumbLink onClick={() => navigate('/center-qn')} className="text-muted-foreground hover:text-foreground">
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
            {/* <Button variant="outline" className="text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800" onClick={handleInviteStudent}>
              Mời tài khoản học viên
            </Button> */}
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

            <Select value={filterState?.birthMonth || "all"} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tháng sinh</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    Tháng {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterState?.birthYear || "all"} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Năm sinh</SelectItem>
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
            <Button 
              variant="outline" 
              className={`gap-2 ${Object.keys(advancedFilters).filter(key => advancedFilters[key as keyof FilterOptions]).length > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white dark:bg-gray-800'
              }`} 
              onClick={handleToggleFilter}
            >
              <Filter className="w-4 h-4" />
              Bộ lọc
              {Object.keys(advancedFilters).filter(key => advancedFilters[key as keyof FilterOptions]).length > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {Object.keys(advancedFilters).filter(key => advancedFilters[key as keyof FilterOptions]).length}
                </span>
              )}
            </Button>

            <FilterPanel
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
              onFilterChange={handleAdvancedFilterChange}
              currentFilters={advancedFilters}
              onClearAll={handleClearAllFilters} // Pass hàm clear all
            />

            {/* <DropdownMenu>
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
            </DropdownMenu> */}
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
        <DataTable
          data={paginatedStudents}
          columns={columns}
          loading={isLoading}
          error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={() => window.location.reload()}
          emptyMessage="Không có học viên nào"
          pagination={paginationConfig}
          rowKey="id"
          onRowClick={(student) => console.log("Clicked student:", student)}
          hoverable={true}
          striped={false}
          enableSearch={false} // Disable built-in search vì đã có search bar ở trên
          enableSort={false}   // Disable built-in sort vì API handle sort
        />
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Create Student Modal */}
      <CreateStudentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateStudentSuccess}
      />
    </div>
  )
}
