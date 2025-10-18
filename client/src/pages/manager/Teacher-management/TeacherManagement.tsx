import { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Trash2,
  Copy,
  Phone,
  Mail,
  Calendar,
} from "lucide-react"
import type { Teacher, Tab, FilterState } from "./types/teacher"
import { toast } from "sonner"
import { DataTable, Column, PaginationConfig } from "../../../components/common/Table"
import { usePagination } from "../../../hooks/usePagination"
import ExcelImportDialog from "../../../components/common/ExcelImportDialog"
import { centerOwnerTeacherService } from "../../../services/center-owner"


export default function TeacherQnmsManagement() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("Nhóm quyền")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [collectData, setCollectData] = useState<boolean>(true)
  const [filterState, setFilterState] = useState<FilterState>({})
  const [excelImportOpen, setExcelImportOpen] = useState<boolean>(false)
  
  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 2,
    totalItems: 0 
  })

  const roleMap: { [key: string]: string } = {
    "Giáo viên": "teacher",
    "Chủ trung tâm": "center_owner",
    "Admin": "admin"
  }

  const statusMap: { [key: string]: string } = {
    "all": "all",
    "active": "active", 
    "inactive": "inactive"
  }

  const { 
    data: teachersData, 
    isLoading: loading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['teachers', debouncedSearchTerm, selectedRole, activeTab, pagination.currentPage, pagination.itemsPerPage, filterState],
    queryFn: async () => {
      const result = await centerOwnerTeacherService.getTeachers({
        search: debouncedSearchTerm || undefined,
        role: selectedRole !== "Nhóm quyền" ? (roleMap[selectedRole] as "teacher" | "admin" | "center_owner") : undefined,
        status: statusMap[activeTab] as "active" | "inactive" | "all",
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc",
        // Add filter parameters
        gender: filterState.gender && filterState.gender !== "all" ? filterState.gender : undefined,
        birthYear: filterState.birthYear || undefined,
      })
      return result
    },
    staleTime: 0, // Không cache data, luôn gọi API mới
    gcTime: 0, // Không giữ data trong cache
    refetchOnWindowFocus: true, // Gọi lại API khi focus vào window
    refetchOnMount: true, // Gọi lại API khi component mount
    refetchOnReconnect: true, // Gọi lại API khi reconnect
  })

  const employeeData = (teachersData as any)?.data || []
  const totalCount = (teachersData as any)?.meta?.total || 0
  const totalPages = (teachersData as any)?.meta?.totalPages || 1
  
  const finalEmployeeData = employeeData
  const finalTotalCount = totalCount

  // Update pagination total items when data changes
  useEffect(() => {
    pagination.setItemsPerPage(pagination.itemsPerPage)
    // Note: We can't directly update totalItems in the hook, so we'll pass it to the table
  }, [totalCount])



  const tabs: Tab[] = [
    { key: "all", label: "Tất cả", count: finalTotalCount },
    { key: "active", label: "Đang hoạt động", count: finalEmployeeData?.filter((emp: Teacher) => emp.status).length || 0 },
    { key: "inactive", label: "Dừng hoạt động", count: finalEmployeeData?.filter((emp: Teacher) => !emp.status).length || 0 },
  ]

  // Debounce search term để giảm số lần gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      // Reset về trang 1 khi search thay đổi
      if (searchTerm !== debouncedSearchTerm) {
        pagination.setCurrentPage(1)
      }
    }, 500) // Delay 500ms

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearchTerm, pagination])

  // Gọi lại API khi component mount (quay lại trang)
  useEffect(() => {
    refetch()
  }, [])

  const toggleStatusMutation = useMutation({
    mutationFn: (employeeId: string) => centerOwnerTeacherService.toggleTeacherStatus(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success("Cập nhật trạng thái giáo viên thành công")
      console.log("Teacher status toggled successfully");
    },
    onError: (error) => {
      console.error("Error toggling teacher status:", error)
      alert("Có lỗi xảy ra khi cập nhật trạng thái giáo viên")
    }
  })

  const handleEmployeeStatusToggle = (employeeId: string): void => {
    toggleStatusMutation.mutate(employeeId);
  }

  const handleViewEmployee = (employeeId: string): void => {
    navigate(`/center-qn/teachers/${employeeId}`)
  }

  const handleCopyCode = (code: string): void => {
    navigator.clipboard.writeText(code.replace("***", ""))
    alert(`Đã sao chép mã: ${code}`)
    console.log(`[v0] Copied code: ${code}`)
  }

  const handleDownloadTemplate = async (): Promise<void> => {
    try {
      const blob = await centerOwnerTeacherService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'teacher_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log("Downloaded teachers template")
    } catch (error) {
      console.error("Error downloading template:", error)
      alert("Có lỗi xảy ra khi tải xuống mẫu")
    }
  }

  const handleUploadFile = (): void => {
    setExcelImportOpen(true)
  }

  const handleImportSuccess = (): void => {
    queryClient.invalidateQueries({ queryKey: ['teachers'] })
    setExcelImportOpen(false)
  }

  const handleRefreshPage = (): void => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setSelectedRole("Nhóm quyền")
    setFilterState({})
    pagination.setCurrentPage(1)
    refetch()
    alert("Đã làm mới dữ liệu")
    console.log("[v0] Refreshed page data")
  }

  const handleDownloadAll = async (): Promise<void> => {
    try {
      const blob = await centerOwnerTeacherService.downloadAllTeachers()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'all_teachers.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log("[v0] Downloaded all employee data")
    } catch (error) {
      console.error("Error downloading all teachers:", error)
      alert("Có lỗi xảy ra khi tải xuống dữ liệu")
    }
  }

  const handleInviteEmployee = (): void => {
    alert("Mở form mời nhân viên...")
    console.log("[v0] Opening invite employee form")
  }

  const handleAddEmployee = (): void => {
    navigate("/center-qn/teachers/add")
  }

  // Define columns for DataTable
  const columns: Column<Teacher>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '80px',
      align: 'center',
      render: (_: Teacher, index: number) => ((pagination.currentPage - 1) * pagination.itemsPerPage + index + 1),
      sortable: true,
      sortKey: 'stt',
    },
    {
      key: 'account',
      header: 'Tài khoản giáo viên',
      width: '300px',
      sortable: true,
      sortKey: 'account',
      render: (employee: Teacher) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-200">
              <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white dark:bg-gray-800 rounded-full"></div>
              </div>
            </AvatarFallback>
          </Avatar>
          <div>
            <div
              className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
              onClick={() => handleViewEmployee(employee.id)}
            >
              {employee.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{employee.username}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{employee.code}</span>
              <Copy
                className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:text-gray-300"
                onClick={() => handleCopyCode(employee.code)}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'info',
      header: 'Thông tin',
      width: '250px',
      render: (employee: Teacher) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Mail className="w-3 h-3" />
            {employee.email}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
            <Phone className="w-3 h-3" />
            {employee.phone}
          </div>
          {employee.birthDate && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-3 h-3" />
              {employee.birthDate} - {employee.gender}
            </div>
          )}
          {!employee.birthDate && <div className="text-sm text-gray-600 dark:text-gray-300">{employee.gender}</div>}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Nhóm quyền',
      width: '150px',
      render: (employee: Teacher) => (
        <Badge variant="secondary" className={getRoleBadgeColor(employee.role)}>
          {employee.role}
        </Badge>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái tài khoản',
      width: '150px',
      align: 'center',
      render: (employee: Teacher) => (
        <Switch 
          checked={employee.status} 
          onCheckedChange={() => handleEmployeeStatusToggle(employee.id)} 
          disabled={loading || toggleStatusMutation.isPending}
        />
      )
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'center',
      render: (employee: Teacher) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => handleViewEmployee(employee.id)}>
              <Eye className="w-4 h-4" />
              Xem
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const getRoleBadgeColor = (role: Teacher["role"]): string => {
    switch (role) {
      case "Chủ trung tâm":
        return "bg-orange-100 text-orange-800"
      case "Giáo viên":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Danh sách giáo viên</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/center-qn" className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Danh sách giáo viên</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3">
          <Button  onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Giáo Viên
            </Button>
            <Button variant="outline" className="text-gray-600 dark:text-gray-300 bg-transparent" onClick={handleInviteEmployee}>
              Mời Giáo Viên
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nhóm quyền">Nhóm quyền</SelectItem>
                <SelectItem value="Giáo viên">Giáo viên</SelectItem>
                <SelectItem value="Chủ trung tâm">Chủ trung tâm</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {/* Loading indicator khi đang debounce */}
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Bộ lọc</h3>
                    <Button variant="ghost" size="sm" onClick={() => setFilterState({})}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Giới tính</label>
                      <Select 
                        value={filterState.gender || "all"} 
                        onValueChange={(value) => setFilterState((prev: FilterState) => ({ ...prev, gender: value === "all" ? undefined : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn giới tính" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="MALE">Nam</SelectItem>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Năm sinh</label>
                      <Input
                        type="number"
                        placeholder="Nhập năm sinh"
                        value={filterState.birthYear || ""}
                        onChange={(e) =>
                          setFilterState((prev: FilterState) => ({ ...prev, birthYear: e.target.value }))
                        }
                      />
                    </div>
                    {/* <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Từ ngày</label>
                        <Input
                          type="date"
                          value={filterState.hireDateFrom || ""}
                          onChange={(e) =>
                            setFilterState((prev: FilterState) => ({ ...prev, hireDateFrom: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Đến ngày</label>
                        <Input
                          type="date"
                          value={filterState.hireDateTo || ""}
                          onChange={(e) =>
                            setFilterState((prev: FilterState) => ({ ...prev, hireDateTo: e.target.value }))
                          }
                        />
                      </div>
                     </div> */}
                     <div className="flex gap-2 pt-2">
                       <Button 
                         size="sm" 
                         variant="outline" 
                         className="flex-1"
                         onClick={() => {
                           setFilterState({})
                           pagination.setCurrentPage(1)
                           refetch()
                         }}
                       >
                         Xóa bộ lọc
                       </Button>
                     </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

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
                  Tải trong trang
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                }`}
              >
                {tab.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={finalEmployeeData}
          columns={columns}
          loading={loading}
          error={error ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={refetch}
          emptyMessage="Không có dữ liệu"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: totalPages,
            totalItems: finalTotalCount,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.setCurrentPage,
            onItemsPerPageChange: pagination.setItemsPerPage,
            showItemsPerPage: true,
            showPageInfo: true
          }}
          rowKey="id"
          hoverable={true}
          striped={false}
        />
      </div>

      {/* Additional Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={collectData} onCheckedChange={setCollectData} />
            <span className="text-sm text-gray-600 dark:text-gray-300">Thu gọn</span>
          </div>
        </div>
      </div>

      {/* Excel Import Dialog */}
      <ExcelImportDialog
        open={excelImportOpen}
        onOpenChange={setExcelImportOpen}
        onImportSuccess={handleImportSuccess}
        downloadTemplate={handleDownloadTemplate}
        uploadFile={centerOwnerTeacherService.uploadTeachers}
      />
    </div>
  )
}
