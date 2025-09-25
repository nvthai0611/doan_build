import { useState, useMemo, useEffect } from "react"
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
  ChevronLeft,
  ChevronRightIcon,
} from "lucide-react"
import type { Employee, Tab, FilterState } from "./types/teacher"
import { teacherService } from "../../../services/teacherService"


export default function TeacherQnmsManagement() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filterOpen, setFilterOpen] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("Nhóm quyền")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [collectData, setCollectData] = useState<boolean>(true)
  const [filterState, setFilterState] = useState<FilterState>({})
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)

  const roleMap: { [key: string]: string } = {
    "Giáo viên": "teacher",
    "Chủ trung tâm": "center_owner",
    "Giáo vụ": "admin"
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
    queryKey: ['teachers', searchTerm, selectedRole, activeTab, currentPage, itemsPerPage],
    queryFn: async () => {
      console.log("Data query:", {
        search: searchTerm || undefined,
        role: selectedRole !== "Nhóm quyền" ? (roleMap[selectedRole] as "teacher" | "admin" | "center_owner") : undefined,
        status: statusMap[activeTab] as "active" | "inactive" | "all",
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc"
      })
      
      const result = await teacherService.getTeachers({
        search: searchTerm || undefined,
        role: selectedRole !== "Nhóm quyền" ? (roleMap[selectedRole] as "teacher" | "admin" | "center_owner") : undefined,
        status: statusMap[activeTab] as "active" | "inactive" | "all",
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "createdAt",
        sortOrder: "desc"
      })
      return result
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000, 
  })

  const employeeData = (teachersData as any)?.data || []
  const totalCount = (teachersData as any)?.meta?.total || 0
  const totalPages = (teachersData as any)?.meta?.totalPages || 1
  
  const finalEmployeeData = employeeData
  const finalTotalCount = totalCount



  const tabs: Tab[] = [
    { key: "all", label: "Tất cả", count: finalTotalCount },
    { key: "active", label: "Đang hoạt động", count: finalEmployeeData?.filter((emp: Employee) => emp.status).length || 0 },
    { key: "inactive", label: "Dừng hoạt động", count: finalEmployeeData?.filter((emp: Employee) => !emp.status).length || 0 },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const paginatedEmployees = finalEmployeeData

  const toggleStatusMutation = useMutation({
    mutationFn: (employeeId: string) => teacherService.toggleTeacherStatus(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      console.log("Teacher status toggled successfully")
    },
    onError: (error) => {
      console.error("Error toggling teacher status:", error)
      alert("Có lỗi xảy ra khi cập nhật trạng thái giáo viên")
    }
  })

  const handleEmployeeStatusToggle = (employeeId: string): void => {
    toggleStatusMutation.mutate(employeeId)
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
      const blob = await teacherService.downloadTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'teacher_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      console.log("[v0] Downloaded employee template")
    } catch (error) {
      console.error("Error downloading template:", error)
      alert("Có lỗi xảy ra khi tải xuống mẫu")
    }
  }

  const handleUploadFile = (): void => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".xlsx,.xls,.csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const result = await teacherService.uploadTeachers(file)
          alert(`Tải lên thành công: ${result.successCount} giáo viên, ${result.errorCount} lỗi`)
          queryClient.invalidateQueries({ queryKey: ['teachers'] }) // Reload data
          console.log(`[v0] Uploaded file: ${file.name}`)
        } catch (error) {
          console.error("Error uploading file:", error)
          alert("Có lỗi xảy ra khi tải lên file")
        }
      }
    }
    input.click()
  }

  const handleRefreshPage = (): void => {
    setSearchTerm("")
    setSelectedRole("Nhóm quyền")
    setFilterState({})
    setCurrentPage(1)
    refetch()
    alert("Đã làm mới dữ liệu")
    console.log("[v0] Refreshed page data")
  }

  const handleDownloadAll = async (): Promise<void> => {
    try {
      const blob = await teacherService.downloadAllTeachers()
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
    alert("Mở form thêm nhân viên mới...")
    console.log("[v0] Opening add employee form")
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: string): void => {
    setItemsPerPage(Number.parseInt(value))
    setCurrentPage(1)
  }

  const getRoleBadgeColor = (role: Employee["role"]): string => {
    switch (role) {
      case "Chủ trung tâm":
        return "bg-orange-100 text-orange-800"
      case "Giáo vụ":
        return "bg-purple-100 text-purple-800"
      case "Giáo viên":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Danh sách giáo viên</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-muted-foreground hover:text-foreground">
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
            <Button variant="outline" className="text-gray-600 bg-transparent" onClick={handleInviteEmployee}>
              Mời nhân viên
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              Nhân viên
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
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
                      <label className="text-sm text-gray-600 mb-1 block">Ngày sinh</label>
                      <Input
                        placeholder="Chọn ngày sinh"
                        value={filterState.birthDate || ""}
                        onChange={(e) =>
                          setFilterState((prev: FilterState) => ({ ...prev, birthDate: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Tháng sinh</label>
                      <Input
                        placeholder="Chọn tháng sinh"
                        value={filterState.birthMonth || ""}
                        onChange={(e) =>
                          setFilterState((prev: FilterState) => ({ ...prev, birthMonth: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 mb-1 block">Năm sinh</label>
                      <Input
                        placeholder="Chọn năm sinh"
                        value={filterState.birthYear || ""}
                        onChange={(e) =>
                          setFilterState((prev: FilterState) => ({ ...prev, birthYear: e.target.value }))
                        }
                      />
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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label} <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài khoản giáo viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nhóm quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái tài khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500">
                    <div className="flex flex-col items-center justify-center">
                      <p>Có lỗi xảy ra khi tải dữ liệu</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetch()}
                        className="mt-2"
                      >
                        Thử lại
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee: Employee, index: number) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gray-200">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
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
                        <div className="text-xs text-gray-500">{employee.username}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <span>{employee.code}</span>
                          <Copy
                            className="w-3 h-3 cursor-pointer hover:text-gray-600"
                            onClick={() => handleCopyCode(employee.code)}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {employee.phone}
                      </div>
                      {employee.birthDate && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {employee.birthDate} - {employee.gender}
                        </div>
                      )}
                      {!employee.birthDate && <div className="text-sm text-gray-600">{employee.gender}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant="secondary" className={getRoleBadgeColor(employee.role)}>
                      {employee.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Switch 
                      checked={employee.status} 
                      onCheckedChange={() => handleEmployeeStatusToggle(employee.id)} 
                      disabled={loading || toggleStatusMutation.isPending}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
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
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={collectData} onCheckedChange={setCollectData} />
                <span className="text-sm text-gray-600">Thu gọn</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
              <div className="text-sm text-gray-600">
                {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, finalTotalCount)}{" "}
                trong {finalTotalCount}
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
