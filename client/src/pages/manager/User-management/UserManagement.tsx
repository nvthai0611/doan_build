'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Edit3,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  UserCheck2,
  UserMinus2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/assets/shadcn-ui/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column, type PaginationConfig } from '@/components/common/Table'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  centerOwnerUserService,
  type ManagedUser,
  type ManagedUserRole,
  type UserListResponse,
} from '@/services/center-owner'
import type { CreateUserPayload, ManagedUserStatus, UpdateUserPayload } from '@/services/center-owner/user-management/user.types'

const statusOptions: Array<{ label: string; value: ManagedUserStatus }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang hoạt động', value: 'active' },
  { label: 'Vô hiệu hóa', value: 'inactive' },
]

const bulkActionOptions: Array<{ label: string; value: BulkAction }> = [
  { label: 'Kích hoạt', value: 'activate' },
  { label: 'Vô hiệu hóa', value: 'deactivate' },
]

type SupportedRole = Extract<ManagedUserRole, 'center_owner' | 'teacher' | 'parent' | 'student'>
type RoleOption = { label: string; value: SupportedRole }
type BulkAction = 'activate' | 'deactivate'
type EditPayload = {
  fullName: string
  email: string
  username: string
  phone?: string | null
}

const supportedRoles: SupportedRole[] = ['center_owner', 'teacher', 'parent', 'student']

const supportedRoleLabels: Record<SupportedRole, string> = {
  center_owner: 'Chủ trung tâm',
  teacher: 'Giáo viên',
  parent: 'Phụ huynh',
  student: 'Học viên',
}

const roleBadgeVariants: Record<SupportedRole, string> = {
  center_owner: 'bg-amber-50 text-amber-700 border border-amber-100',
  teacher: 'bg-green-50 text-green-700 border border-green-100',
  parent: 'bg-slate-50 text-slate-700 border border-slate-100',
  student: 'bg-cyan-50 text-cyan-700 border border-cyan-100',
}

const genderLabels: Record<'MALE' | 'FEMALE' | 'OTHER', string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
}

const relationshipTypeLabels: Record<'FATHER' | 'MOTHER' | 'OTHER', string> = {
  FATHER: 'Cha',
  MOTHER: 'Mẹ',
  OTHER: 'Khác',
}

const statusBadgeClasses = (isActive: boolean) =>
  isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'

const defaultCreatePayload: CreateUserPayload = {
  fullName: '',
  email: '',
  username: '',
  role: 'teacher',
  phone: '',
  password: '',
  gender: undefined,
  birthDate: undefined,
  isActive: true,
}

function formatDate(date?: string | null) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

function formatDateTime(date?: string | null) {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

function getInitials(name: string) {
  if (!name) return 'US'
  const [first, second] = name.split(' ')
  if (second) {
    return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
  }
  return first.slice(0, 2).toUpperCase()
}

export default function UserManagement() {
  const queryClient = useQueryClient()
  const pagination = usePagination({ initialPage: 1, initialItemsPerPage: 10 })

  const [searchValue, setSearchValue] = useState('')
  const debouncedSearch = useDebounce(searchValue, 500)
  const [statusFilter, setStatusFilter] = useState<ManagedUserStatus>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | ManagedUserRole>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [createPayload, setCreatePayload] = useState<CreateUserPayload>(defaultCreatePayload)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [forceLogout, setForceLogout] = useState(true)
  const [useCustomPassword, setUseCustomPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [roleUser, setRoleUser] = useState<ManagedUser | null>(null)
  const [roleSelection, setRoleSelection] = useState<SupportedRole>('teacher')
  const [bulkAction, setBulkAction] = useState<BulkAction>('activate')
  const [isDetailEditing, setIsDetailEditing] = useState(false)
  const [detailEditPayload, setDetailEditPayload] = useState<EditPayload | null>(null)
  const [teacherCollapsibleOpen, setTeacherCollapsibleOpen] = useState(false)
  const [parentCollapsibleOpen, setParentCollapsibleOpen] = useState(false)
  const [studentCollapsibleOpen, setStudentCollapsibleOpen] = useState(false)

  const {
    data: usersResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<UserListResponse>({
    queryKey: [
      'users-management-list',
      debouncedSearch,
      statusFilter,
      roleFilter,
      pagination.currentPage,
      pagination.itemsPerPage,
    ],
    queryFn: async () => {
      const payload = {
        search: debouncedSearch || undefined,
        status: statusFilter,
        role: roleFilter,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      }
      const response = await centerOwnerUserService.getUsers(payload)
      return response
    },
    keepPreviousData: true,
  })

  const {
    data: detailResponse,
    isLoading: detailLoading,
  } = useQuery({
    queryKey: ['users-management-detail', detailUserId],
    queryFn: () => centerOwnerUserService.getUserById(detailUserId!),
    enabled: Boolean(detailUserId),
  })

  useEffect(() => {
    if (usersResponse?.meta?.total !== undefined) {
      pagination.setTotalItems(usersResponse.meta.total)
    }
  }, [usersResponse?.meta?.total, pagination])

  useEffect(() => {
    setIsDetailEditing(false)
    setDetailEditPayload(null)
  }, [detailUserId])

  const users = usersResponse?.data ?? []
  const summary = usersResponse?.summary
  const filters = usersResponse?.filters
  const totalItems = usersResponse?.meta?.total ?? 0
  const totalPages = usersResponse?.meta?.totalPages ?? 1

  const fallbackRoleOptions: RoleOption[] = supportedRoles.map((role) => ({
    label: supportedRoleLabels[role],
    value: role,
  }))

  const roleOptions: RoleOption[] =
    filters?.roles
      ?.map((role: { label: string; value: string }) => ({
        label: role.label,
        value: role.value as SupportedRole,
      }))
      .filter((role: RoleOption): role is RoleOption => supportedRoles.includes(role.value)) ?? fallbackRoleOptions

  const handleRefresh = useCallback(() => {
    refetch()
    toast.success('Đã làm mới danh sách người dùng')
  }, [refetch])

  const handleClearFilters = () => {
    setStatusFilter('all')
    setRoleFilter('all')
    pagination.setCurrentPage(1)
    setSelectedUserIds([])
  }

  const handleOpenRoleAssign = (user: ManagedUser) => {
    setRoleUser(user)
    setRoleSelection(supportedRoles.includes(user.role as SupportedRole) ? (user.role as SupportedRole) : 'teacher')
  }

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => centerOwnerUserService.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] })
      toast.success('Cập nhật trạng thái tài khoản thành công')
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || 'Không thể cập nhật trạng thái')
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      centerOwnerUserService.updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] })
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || 'Không thể cập nhật người dùng')
    },
  })

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: BulkAction; ids: string[] }) => {
      await Promise.all(
        ids.map((id) =>
          centerOwnerUserService.updateUser(id, {
            isActive: action === 'activate',
          }),
        ),
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] })
      toast.success('Thao tác hàng loạt thành công')
      setSelectedUserIds([])
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || 'Không thể thực hiện thao tác hàng loạt')
    },
  })

  const createUserMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => centerOwnerUserService.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management-list'] })
      toast.success('Tạo tài khoản người dùng thành công')
      setCreatePayload(defaultCreatePayload)
      setCreateOpen(false)
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || 'Không thể tạo người dùng')
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password, forceLogout: shouldForceLogout }: { userId: string; password?: string; forceLogout: boolean }) =>
      centerOwnerUserService.resetPassword(userId, {
        forceLogout: shouldForceLogout,
        newPassword: password && password.trim().length > 0 ? password.trim() : undefined,
      }),
    onSuccess: (response, variables) => {
      toast.success('Đặt lại mật khẩu thành công')
      if (response?.data?.temporaryPassword) {
        navigator.clipboard.writeText(response.data.temporaryPassword).catch(() => null)
        toast.info(`Mật khẩu tạm thời: ${response.data.temporaryPassword}`)
      } 
      setResetUserId(null)
      setForceLogout(true)
      setUseCustomPassword(false)
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || 'Không thể đặt lại mật khẩu')
    },
  })

  const handleToggleStatus = (userId: string) => {
    setPendingToggleId(userId)
    toggleStatusMutation.mutate(userId, {
      onSettled: () => setPendingToggleId(null),
    })
  }

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!createPayload.fullName || !createPayload.email || !createPayload.username) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc')
      return
    }
    createUserMutation.mutate({
      ...createPayload,
      email: createPayload.email.trim(),
      username: createPayload.username.trim(),
      phone: createPayload.phone?.trim() || undefined,
      password: createPayload.password?.trim() || undefined,
    })
  }

  const handleRowClick = (user: ManagedUser) => {
    setDetailUserId(user.id)
  }

  const handleDetailEditStart = () => {
    if (!detailUser) return
    setDetailEditPayload({
      fullName: detailUser.fullName,
      email: detailUser.email,
      username: detailUser.username,
      phone: detailUser.phone ?? '',
    })
    setIsDetailEditing(true)
  }

  const handleDetailEditCancel = () => {
    setIsDetailEditing(false)
    setDetailEditPayload(null)
  }

  const handleDetailEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!detailUser || !detailEditPayload) return

    updateUserMutation.mutate(
      {
        id: detailUser.id,
        payload: {
          fullName: detailEditPayload.fullName.trim(),
          email: detailEditPayload.email.trim().toLowerCase(),
          username: detailEditPayload.username.trim(),
          phone: detailEditPayload.phone?.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật hồ sơ người dùng thành công')
          setIsDetailEditing(false)
          setDetailEditPayload(null)
        },
      },
    )
  }

  const handleRoleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!roleUser) return

    updateUserMutation.mutate(
      {
        id: roleUser.id,
        payload: { role: roleSelection },
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật vai trò thành công')
          setRoleUser(null)
        },
      },
    )
  }

  const handleBulkApply = () => {
    if (!selectedUserIds.length) return
    bulkActionMutation.mutate({ action: bulkAction, ids: selectedUserIds })
  }

  const columns: Column<ManagedUser>[] = useMemo(
    () => [
      {
        key: 'index',
        header: '#',
        width: '60px',
        align: 'center',
        render: (_item, index) =>
          (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
      },
      {
        key: 'user',
        header: 'Người dùng',
        width: '320px',
        render: (item) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.avatar ?? undefined} alt={item.fullName} />
              <AvatarFallback>{getInitials(item.fullName)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium text-sm text-gray-900">
                {item.fullName}
              </div>
              <div className="text-xs text-gray-500">{item.email}</div>
              <div className="text-xs text-gray-400">@{item.username}</div>
            </div>
          </div>
        ),
      },
      {
        key: 'role',
        header: 'Vai trò',
        width: '200px',
        render: (item) => (
          <Badge
            className={cn(
              'capitalize',
              roleBadgeVariants[item.role as SupportedRole] ??
                'bg-gray-50 text-gray-700',
            )}
          >
            {item.roleDisplayName}
          </Badge>
        ),
      },
      {
        key: 'createdAt',
        header: 'Ngày tạo',
        width: '160px',
        render: (item) => (
          <span className="text-sm text-gray-600">
            {formatDate(item.createdAt)}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        header: 'Đăng nhập gần nhất',
        width: '200px',
        render: (item) => (
          <span className="text-sm text-gray-600">
            {formatDateTime(item.lastLoginAt)}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: '150px',
        align: 'center',
        render: (item) => (
          <div
            className="inline-flex items-center gap-2"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <Switch
              checked={item.isActive}
              onCheckedChange={() => handleToggleStatus(item.id)}
              disabled={
                pendingToggleId === item.id || toggleStatusMutation.isPending
              }
            />
            <Badge className={statusBadgeClasses(item.isActive)}>
              {item.isActive ? 'Hoạt động' : 'Đã khóa'}
            </Badge>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        align: 'center',
        width: '100px',
        render: (item) => (
          <div
            className="flex items-center justify-center gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRowClick(item)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleOpenRoleAssign(item)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gán / sửa vai trò</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setResetUserId(item.id)}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Đặt lại mật khẩu</TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [
      pagination,
      pendingToggleId,
      toggleStatusMutation.isPending,
      handleRowClick,
      handleOpenRoleAssign,
    ],
  );

  const paginationConfig: PaginationConfig = {
    currentPage: pagination.currentPage,
    totalPages,
    totalItems,
    itemsPerPage: pagination.itemsPerPage,
    onPageChange: (page) => pagination.setCurrentPage(page),
    onItemsPerPageChange: (size) => {
      pagination.setItemsPerPage(size)
      pagination.setCurrentPage(1)
    },
  }

  const errorMessage = error instanceof Error ? error.message : undefined
  const detailUser = detailResponse?.data

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-muted/20 p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Quản trị người dùng</p>
            <h1 className="text-2xl font-semibold text-foreground">User Management</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {selectedUserIds.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-sm font-medium text-foreground">
              Đã chọn {selectedUserIds.length} người dùng
            </div>
            <Select value={bulkAction} onValueChange={(value: BulkAction) => setBulkAction(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bulkActionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleBulkApply} disabled={bulkActionMutation.isPending}>
              {bulkActionMutation.isPending ? 'Đang xử lý...' : 'Thực hiện'}
            </Button>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Tổng số người dùng"
            value={summary?.totalUsers ?? 0}
            icon={Users}
            trend={`+${summary?.newUsersThisMonth ?? 0} trong tháng`}
          />
          <StatCard
            title="Đang hoạt động"
            value={summary?.activeUsers ?? 0}
            icon={UserCheck2}
            trend="Trạng thái khả dụng"
          />
          <StatCard
            title="Vô hiệu hóa"
            value={summary?.inactiveUsers ?? 0}
            icon={UserMinus2}
            trend="Tài khoản bị khóa"
          />
          <StatCard
            title="Vai trò đã gán"
            value={users.reduce<number>((total: number, user: ManagedUser) => total + (user.permissionCount || 0), 0)}
            icon={ShieldCheck}
            trend="Tổng quyền theo vai trò"
          />
        </div>

        <div className="mt-6 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, username..."
                className="pl-9"
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value)
                  pagination.setCurrentPage(1)
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select value={roleFilter} onValueChange={(value: 'all' | ManagedUserRole) => setRoleFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value: ManagedUserStatus) => setStatusFilter(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Xóa lọc
              </Button>
            </div>
          </div>

          <div className="rounded-lg border">
            <DataTable
              data={users}
              columns={columns}
              loading={isLoading || isFetching}
              error={errorMessage}
              emptyMessage="Không có người dùng nào khớp bộ lọc"
              pagination={paginationConfig}
              hoverable
              onRowClick={handleRowClick}
              rowKey="id"
              enableCheckbox
              selectedItems={selectedUserIds}
              onSelectionChange={setSelectedUserIds}
              getItemId={(item) => item.id}
              allData={users}
            />
          </div>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm người dùng mới</DialogTitle>
              <DialogDescription>Nhập thông tin người dùng và gán vai trò phù hợp.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Họ và tên <span className="text-red-500">*</span></Label>
                  <Input
                    value={createPayload.fullName}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, fullName: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email <span className="text-red-500">*</span></Label>
                  <Input
                    type="email"
                    value={createPayload.email}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, email: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tên đăng nhập <span className="text-red-500">*</span></Label>
                  <Input
                    value={createPayload.username}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, username: event.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Số điện thoại</Label>
                  <Input
                    value={createPayload.phone}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, phone: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mật khẩu</Label>
                  <Input
                    type="password"
                    value={createPayload.password}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, password: event.target.value }))}
                    placeholder="Mặc định 123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Vai trò</Label>
                  <Select
                    value={createPayload.role}
                    onValueChange={(value: ManagedUserRole) => setCreatePayload((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={createPayload.gender ?? 'MALE'}
                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') =>
                      setCreatePayload((prev) => ({ ...prev, gender: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      {/* <SelectItem value="OTHER">Khác</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Input
                    type="date"
                    value={createPayload.birthDate ?? ''}
                    onChange={(event) => setCreatePayload((prev) => ({ ...prev, birthDate: event.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Trạng thái tài khoản</p>
                  <p className="text-xs text-muted-foreground">Cho phép đăng nhập ngay sau khi tạo</p>
                </div>
                <Switch
                  checked={createPayload.isActive}
                  onCheckedChange={(checked) => setCreatePayload((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(roleUser)}
          onOpenChange={(open) => {
            if (!open) {
              setRoleUser(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Gán / sửa vai trò</DialogTitle>
              <DialogDescription>Chọn vai trò phù hợp cho người dùng.</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleRoleSubmit}>
              <div className="space-y-2">
                <Label>Vai trò</Label>
                <Select value={roleSelection} onValueChange={(value: SupportedRole) => setRoleSelection(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setRoleUser(null)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Sheet
          open={Boolean(detailUserId)}
          onOpenChange={(open) => {
            if (!open) {
              setDetailUserId(null)
              setIsDetailEditing(false)
              setDetailEditPayload(null)
            }
          }}
        >
          <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
            <SheetHeader>
              <SheetTitle>Thông tin chi tiết người dùng</SheetTitle>
            </SheetHeader>
            {detailLoading && (
              <div className="py-10 text-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>
            )}
            {!detailLoading && detailUser && (
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={detailUser.avatar ?? undefined} alt={detailUser.fullName} />
                      <AvatarFallback>{getInitials(detailUser.fullName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold">{detailUser.fullName}</p>
                      <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                      <p className="text-xs text-muted-foreground">@{detailUser.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isDetailEditing ? (
                      <Button size="sm" variant="outline" onClick={handleDetailEditStart}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Sửa thông tin
                      </Button>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={handleDetailEditCancel}>
                          Hủy thay đổi
                        </Button>
                        <Button
                          size="sm"
                          type="submit"
                          form="detail-edit-form"
                          disabled={updateUserMutation.isPending}
                        >
                          {updateUserMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {isDetailEditing ? (
                  <form id="detail-edit-form" className="grid gap-4" onSubmit={handleDetailEditSubmit}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label>Họ và tên</Label>
                        <Input
                          value={detailEditPayload?.fullName ?? ''}
                          onChange={(event) =>
                            setDetailEditPayload((prev) =>
                              prev
                                ? { ...prev, fullName: event.target.value }
                                : {
                                    fullName: event.target.value,
                                    email: detailUser.email,
                                    username: detailUser.username,
                                    phone: detailUser.phone ?? '',
                                  },
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={detailEditPayload?.email ?? ''}
                          onChange={(event) =>
                            setDetailEditPayload((prev) =>
                              prev
                                ? { ...prev, email: event.target.value }
                                : {
                                    fullName: detailUser.fullName,
                                    email: event.target.value,
                                    username: detailUser.username,
                                    phone: detailUser.phone ?? '',
                                  },
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Username</Label>
                        <Input
                          value={detailEditPayload?.username ?? ''}
                          onChange={(event) =>
                            setDetailEditPayload((prev) =>
                              prev
                                ? { ...prev, username: event.target.value }
                                : {
                                    fullName: detailUser.fullName,
                                    email: detailUser.email,
                                    username: event.target.value,
                                    phone: detailUser.phone ?? '',
                                  },
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Số điện thoại</Label>
                        <Input
                          value={detailEditPayload?.phone ?? ''}
                          onChange={(event) =>
                            setDetailEditPayload((prev) =>
                              prev
                                ? { ...prev, phone: event.target.value }
                                : {
                                    fullName: detailUser.fullName,
                                    email: detailUser.email,
                                    username: detailUser.username,
                                    phone: event.target.value,
                                  },
                            )
                          }
                        />
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="grid gap-3">
                    <DetailRow label="Vai trò" value={detailUser.roleDisplayName} />
                    <DetailRow label="Trạng thái" value={detailUser.isActive ? 'Hoạt động' : 'Đã khóa'} />
                    <DetailRow
                      label="Giới tính"
                      value={
                        detailUser.gender
                          ? genderLabels[detailUser.gender as keyof typeof genderLabels] || detailUser.gender
                          : '—'
                      }
                    />
                    <DetailRow label="Ngày sinh" value={formatDate(detailUser.birthDate)} />
                    <DetailRow label="Ngày tạo" value={formatDateTime(detailUser.createdAt)} />
                    <DetailRow label="Đăng nhập gần nhất" value={formatDateTime(detailUser.lastLoginAt)} />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Liên kết</h3>
                  <div className="space-y-2">
                    {detailUser.linkedEntities.teacher && (
                      <Collapsible open={teacherCollapsibleOpen} onOpenChange={setTeacherCollapsibleOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Giáo viên</span>
                            <Badge variant="outline" className="text-xs">
                              {detailUser.linkedEntities.teacher.teacherCode || '—'}
                            </Badge>
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              teacherCollapsibleOpen && 'rotate-180',
                            )}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-3">
                          <div className="mt-2 grid gap-2 border-t pt-3">
                            <DetailRow label="Mã giáo viên" value={detailUser.linkedEntities.teacher.teacherCode || '—'} />
                            <DetailRow
                              label="Trường học"
                              value={detailUser.linkedEntities.teacher.schoolName || '—'}
                            />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    {detailUser.linkedEntities.parent && (
                      <Collapsible open={parentCollapsibleOpen} onOpenChange={setParentCollapsibleOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Phụ huynh</span>
                            <Badge variant="outline" className="text-xs">
                              {detailUser.linkedEntities.parent.relationshipType
                                ? relationshipTypeLabels[
                                    detailUser.linkedEntities.parent.relationshipType as keyof typeof relationshipTypeLabels
                                  ] || detailUser.linkedEntities.parent.relationshipType
                                : '—'}
                            </Badge>
                            {detailUser.linkedEntities.parent.studentsCount !== undefined &&
                              detailUser.linkedEntities.parent.studentsCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {detailUser.linkedEntities.parent.studentsCount} con
                                </Badge>
                              )}
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              parentCollapsibleOpen && 'rotate-180',
                            )}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-3">
                          <div className="mt-2 grid gap-2 border-t pt-3">
                            <DetailRow
                              label="Mối quan hệ"
                              value={
                                detailUser.linkedEntities.parent.relationshipType
                                  ? relationshipTypeLabels[
                                      detailUser.linkedEntities.parent.relationshipType as keyof typeof relationshipTypeLabels
                                    ] || detailUser.linkedEntities.parent.relationshipType
                                  : '—'
                              }
                            />
                            {detailUser.linkedEntities.parent.studentsCount !== undefined && (
                              <DetailRow
                                label="Số lượng học sinh"
                                value={detailUser.linkedEntities.parent.studentsCount || 0}
                              />
                            )}
                            {detailUser.linkedEntities.parent.students &&
                              detailUser.linkedEntities.parent.students.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Danh sách con:</p>
                                  <div className="space-y-2">
                                    {detailUser.linkedEntities.parent.students.map((student) => (
                                      <div
                                        key={student.id}
                                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                      >
                                        <div>
                                          <p className="font-medium">{student.fullName || '—'}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {student.studentCode || `ID: ${student.id}`}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    {detailUser.linkedEntities.student && (
                      <Collapsible open={studentCollapsibleOpen} onOpenChange={setStudentCollapsibleOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-4 py-3 text-left hover:bg-accent">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Học sinh</span>
                            <Badge variant="outline" className="text-xs">
                              {detailUser.linkedEntities.student.studentCode || '—'}
                            </Badge>
                            {detailUser.linkedEntities.student.parent && (
                              <Badge variant="secondary" className="text-xs">
                                {detailUser.linkedEntities.student.parent.fullName || '—'}
                              </Badge>
                            )}
                          </div>
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 transition-transform duration-200',
                              studentCollapsibleOpen && 'rotate-180',
                            )}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-3">
                          <div className="mt-2 grid gap-2 border-t pt-3">
                            <DetailRow
                              label="Mã học sinh"
                              value={detailUser.linkedEntities.student.studentCode || '—'}
                            />
                            <DetailRow label="Lớp" value={detailUser.linkedEntities.student.grade || '—'} />
                            {detailUser.linkedEntities.student.parent && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-muted-foreground mb-2">Phụ huynh:</p>
                                <div className="rounded-md border px-3 py-2">
                                  <p className="text-sm font-medium">
                                    {detailUser.linkedEntities.student.parent.fullName || '—'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {detailUser.linkedEntities.student.parent.relationshipType
                                      ? relationshipTypeLabels[
                                          detailUser.linkedEntities.student.parent.relationshipType as keyof typeof relationshipTypeLabels
                                        ] || detailUser.linkedEntities.student.parent.relationshipType
                                      : '—'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    {!detailUser.linkedEntities.teacher &&
                      !detailUser.linkedEntities.parent &&
                      !detailUser.linkedEntities.student && (
                        <p className="text-sm text-muted-foreground py-4 text-center">Chưa có liên kết nào.</p>
                      )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Phiên đăng nhập gần đây</h3>
                  <div className="mt-2 space-y-2 rounded-md border p-3">
                    {detailUser.sessions.length === 0 && (
                      <p className="text-sm text-muted-foreground">Chưa ghi nhận phiên đăng nhập nào.</p>
                    )}
                    {detailUser.sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between text-sm">
                        <span>{formatDateTime(session.createdAt)}</span>
                        <Badge variant={session.isActive ? 'secondary' : 'outline'}>
                          {session.isActive ? 'Đang hoạt động' : 'Đã kết thúc'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        <AlertDialog
          open={Boolean(resetUserId)}
          onOpenChange={(open) => {
            if (!open) {
              setResetUserId(null)
              setUseCustomPassword(false)
              setNewPassword('')
              setConfirmPassword('')
              setShowPassword(false)
              setShowConfirmPassword(false)
              setForceLogout(true)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Đặt lại mật khẩu?</AlertDialogTitle>
              <AlertDialogDescription>
                {useCustomPassword
                  ? 'Nhập mật khẩu mới cho người dùng. Người dùng sẽ được yêu cầu thay đổi sau khi đăng nhập.'
                  : 'Hệ thống sẽ sinh mật khẩu tạm thời và sao chép vào clipboard của bạn. Người dùng sẽ được yêu cầu thay đổi sau khi đăng nhập.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Nhập mật khẩu tùy chỉnh</p>
                  <p className="text-xs text-muted-foreground">Sử dụng mật khẩu do bạn chỉ định</p>
                </div>
                <Switch checked={useCustomPassword} onCheckedChange={setUseCustomPassword} />
              </div>
              {useCustomPassword && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Mật khẩu phải có ít nhất 6 ký tự</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu để xác nhận"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={6}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500">Mật khẩu xác nhận không khớp</p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Buộc đăng xuất khỏi tất cả thiết bị</p>
                  <p className="text-xs text-muted-foreground">Vô hiệu hóa phiên đăng nhập hiện tại</p>
                </div>
                <Switch checked={forceLogout} onCheckedChange={setForceLogout} />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setResetUserId(null)
                  setUseCustomPassword(false)
                  setNewPassword('')
                  setConfirmPassword('')
                  setShowPassword(false)
                  setShowConfirmPassword(false)
                  setForceLogout(true)
                }}
              >
                Hủy
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (useCustomPassword) {
                    if (!newPassword || newPassword.length < 6) {
                      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
                      return
                    }
                    if (!confirmPassword) {
                      toast.error('Vui lòng xác nhận mật khẩu')
                      return
                    }
                    if (newPassword !== confirmPassword) {
                      toast.error('Mật khẩu xác nhận không khớp')
                      return
                    }
                  }
                  if (resetUserId) {
                    resetPasswordMutation.mutate({
                      userId: resetUserId,
                      password: useCustomPassword ? newPassword : undefined,
                      forceLogout,
                    })
                  }
                }}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

interface StatCardProps {
  title: string
  value: number
  trend?: string
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, trend, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
      </CardContent>
    </Card>
  )
}

interface DetailRowProps {
  label: string
  value: string | number | null | undefined
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  )
}