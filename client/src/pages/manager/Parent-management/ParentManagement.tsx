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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Plus,
  Phone,
  Calendar,
  Copy,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { ParentService } from "../../../services/center-owner/parent-management/parent.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable } from "../../../components/common/Table/DataTable"
import { useNavigate } from "react-router-dom"
import { CreateParentModal } from "./components/CreateParentModal"
import { EditParentModal } from "./components/EditParentModal"

export default function ParentManagement() {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [selectedParent, setSelectedParent] = useState<any>(null)
  
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const tabs = [
    { key: "all", label: "Tất cả", count: 0 },
    { key: "active", label: "Hoạt động", count: 0 },
    { key: "inactive", label: "Vô hiệu hóa", count: 0 },
  ]

  const gender: any = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác"
  }

  // Fetch parent list
  const { data: parentData, isLoading, isError, refetch } = useQuery({
    queryKey: ["parents", { 
      searchTerm: searchQuery,
      activeTab,
      currentPage,
      itemsPerPage
    }],
    queryFn: () => ParentService.getListParents({
      search: searchQuery,
      isActive: activeTab === "all" ? undefined : activeTab === "active",
      page: currentPage,
      limit: itemsPerPage,
    }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Fetch count by status
  const { data: statusData } = useQuery({
    queryKey: ["parent-status"],
    queryFn: ParentService.getCountByStatus,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  // Toggle parent status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ParentService.toggleParentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents"] })
      queryClient.invalidateQueries({ queryKey: ["parent-status"] })
      toast.success("Đã cập nhật trạng thái phụ huynh")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi cập nhật trạng thái")
    }
  })
  
  const parents = parentData || []
  const totalPages = parentData?.pagination?.totalPages || 1
  const totalCount = parentData?.pagination?.total || 0

  // Search handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handleSearchKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchQuery(searchTerm)
      setCurrentPage(1)
    }
  }, [searchTerm])

  const handleSearchSubmit = useCallback(() => {
    setSearchQuery(searchTerm)
    setCurrentPage(1)
  }, [searchTerm])

  // Action handlers
  const handleCopyCode = (email: string): void => {
    navigator.clipboard.writeText(email)
    toast.success(`Đã sao chép email: ${email}`)
  }

  const handleAddParent = (): void => {
    setIsCreateModalOpen(true)
  }

  const handleEditParent = (parent: any): void => {
    setSelectedParent(parent)
    setIsEditModalOpen(true)
  }

  const handleViewParent = (parentId: string): void => {
    navigate(`/center-qn/parents/${parentId}`)
  }

  const handlePageChange = (page: number): void => {
    setCurrentPage(page)
  }

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey)
    setCurrentPage(1)
  }

  const handleToggleAccountStatus = async (parentId: string, currentStatus: boolean) => {
    try {
      await toggleStatusMutation.mutateAsync(parentId)
    } catch (error) {
      console.error('Error toggling account status:', error)
    }
  }

  const getTabCount = (tabKey: string): number => {
    if (!statusData) return 0
    if (tabKey === "all") return statusData.total
    if (tabKey === "active") return statusData.active
    if (tabKey === "inactive") return statusData.inactive
    return 0
  }

  // Define columns for DataTable
  const columns = useMemo(() => [
    // STT Column
    {
      key: "stt",
      header: "STT",
      width: "80px",
      render: (parent: any, index: number) => (
        <span className="text-sm text-gray-900 dark:text-white">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      )
    },
    // Parent Account Column
    {
      key: "account",
      header: "Tài khoản phụ huynh",
      width: "300px",
      render: (parent: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              onClick={() => handleViewParent(parent?.id)}
            >
              {parent?.user?.fullName || "N/A"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <span>{parent?.user?.email || "N/A"}</span>
              <Copy
                className="w-3 h-3 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  handleCopyCode(parent?.user?.email || "")
                }}
              />
            </div>
            <div className="text-xs text-gray-400">
              Username: {parent?.user?.username || "N/A"}
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
      render: (parent: any) => (
        <div className="space-y-1">
          {parent?.user?.phone && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <Phone className="w-3 h-3" />
              {parent.user.phone}
            </div>
          )}
          {!parent?.user?.phone && <div className="text-sm text-gray-400">-</div>}
          {parent?.user?.birthDate && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-3 h-3" />
              {new Date(parent.user.birthDate).toLocaleDateString('vi-VN')} - {gender[parent?.user?.gender] || "N/A"}
            </div>
          )}
          {!parent?.user?.birthDate && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {gender[parent?.user?.gender] || "N/A"}
            </div>
          )}
        </div>
      )
    },
    // Students Column
    {
      key: "students",
      header: "Học sinh",
      width: "250px",
      render: (parent: any) => (
        <div className="space-y-1">
          {parent?.students && parent.students.length > 0 ? (
            parent.students.map((student: any, idx: number) => (
              <div key={idx} className="text-sm text-gray-900 dark:text-white">
                {student?.user?.fullName} ({student?.studentCode})
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-400">Chưa có học sinh</span>
          )}
        </div>
      )
    },
    // Created Date Column
    {
      key: "createdAt",
      header: "Ngày tạo",
      width: "150px",
      render: (parent: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {parent?.createdAt ? new Date(parent.createdAt).toLocaleDateString('vi-VN') : "-"}
        </span>
      )
    },
    // Actions Column
    // {
    //   key: "actions",
    //   header: "Thao tác",
    //   width: "150px",
    //   align: "center" as const,
    //   render: (parent: any) => (
    //     <div className="flex items-center justify-center gap-2">
    //       <Button
    //         size="sm"
    //         variant="outline"
    //         onClick={(e) => {
    //           e.stopPropagation()
    //           handleEditParent(parent)
    //         }}
    //         className="text-blue-600 hover:bg-blue-50 border-blue-200"
    //       >
    //         Chỉnh sửa
    //       </Button>
    //     </div>
    //   )
    // },
    // Account Status Column
    {
      key: "accountStatus",
      header: "Trạng thái",
      width: "250px",
      align: "right" as const,
      render: (parent: any) => (
        <div className="flex items-center justify-end gap-3">
          <Switch
            checked={parent?.user?.isActive || false}
            onCheckedChange={() => handleToggleAccountStatus(parent?.id, parent?.user?.isActive)}
            disabled={toggleStatusMutation.isPending}
            className="data-[state=checked]:bg-green-600"
          />
          <span className={`text-sm font-medium ${
            parent?.user?.isActive 
              ? "text-green-700 dark:text-green-400" 
              : "text-red-700 dark:text-red-400"
          }`}>
            {parent?.user?.isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </span>
        </div>
      )
    }
  ], [currentPage, itemsPerPage, handleCopyCode, handleToggleAccountStatus, handleEditParent, handleViewParent, toggleStatusMutation.isPending])

  // Pagination config
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
          <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu phụ huynh...</p>
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
          <Button onClick={() => refetch()}>Thử lại</Button>
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
            <h1 className="text-2xl font-semibold text-foreground">Danh sách phụ huynh</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => navigate('/center-qn')} className="text-muted-foreground hover:text-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">Danh sách phụ huynh</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="text-white border-blue-600 bg-blue-600 hover:bg-blue-700"
              onClick={handleAddParent}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm phụ huynh
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên, email, số điện thoại (nhấn Enter)"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
                className="pl-10 pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchSubmit}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </Button>
              {searchTerm !== searchQuery && searchQuery && (
                <div className="absolute -bottom-6 left-0 text-xs text-gray-500">
                  Đang hiển thị kết quả cho: "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Table */}
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
          data={parentData?.data || []}
          columns={columns}
          loading={isLoading}
          error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={() => refetch()}
          emptyMessage="Không có phụ huynh nào"
          pagination={paginationConfig}
          rowKey="id"
          onRowClick={(parent) => handleViewParent(parent.id)}
          hoverable={true}
          striped={false}
          enableSearch={false}
          enableSort={false}
        />
      </div>

      {/* Modals */}
      <CreateParentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          refetch()
        }}
      />

      <EditParentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedParent(null)
        }}
        parentId={selectedParent?.id}
        parentData={selectedParent}
      />
    </div>
  )
}
