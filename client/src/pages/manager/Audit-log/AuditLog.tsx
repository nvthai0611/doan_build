'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Database,
  Activity,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/assets/shadcn-ui/components/ui/button'
import { Input } from '@/assets/shadcn-ui/components/ui/input'
import { Badge } from '@/assets/shadcn-ui/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/assets/shadcn-ui/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/assets/shadcn-ui/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/assets/shadcn-ui/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/assets/shadcn-ui/components/ui/card'
import { Label } from '@/assets/shadcn-ui/components/ui/label'
import { usePagination } from '@/hooks/usePagination'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTable, type Column, type PaginationConfig } from '@/components/common/Table'
import { cn } from '@/lib/utils'
import { auditLogService, type AuditLog, type QueryAuditLogParams } from '@/services/adminit/audit-log/audit-log.service'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/assets/shadcn-ui/components/ui/collapsible'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/assets/shadcn-ui/components/ui/tooltip'
import { TooltipProvider } from '@radix-ui/react-tooltip'

const actionOptions: Array<{ label: string; value: QueryAuditLogParams['action'] }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Tạo mới', value: 'create' },
  { label: 'Cập nhật', value: 'update' },
  { label: 'Xóa', value: 'delete' },
]

const actionBadgeVariants: Record<string, string> = {
  create: 'bg-green-50 text-green-700 border border-green-100',
  update: 'bg-blue-50 text-blue-700 border border-blue-100',
  delete: 'bg-red-50 text-red-700 border border-red-100',
  login: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  logout: 'bg-slate-50 text-slate-700 border border-slate-100',
}

const actionLabels: Record<string, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
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

function getInitials(name: string | null | undefined) {
  if (!name) return 'US'
  const [first, second] = name.split(' ')
  if (second) {
    return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
  }
  return first.slice(0, 2).toUpperCase()
}

export default function AuditLog() {
  const pagination = usePagination({ initialPage: 1, initialItemsPerPage: 20 })
  const [searchValue, setSearchValue] = useState('')
  const [actionFilter, setActionFilter] = useState<QueryAuditLogParams['action']>('all')
  const [tableNameFilter, setTableNameFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(searchValue, 500)
  const debouncedTableName = useDebounce(tableNameFilter, 500)

  const queryParams: QueryAuditLogParams = useMemo(
    () => ({
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      search: debouncedSearch || undefined,
      action: actionFilter !== 'all' ? actionFilter : undefined,
      tableName: debouncedTableName || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy: 'timestamp',
      sortOrder: 'desc',
    }),
    [pagination.currentPage, pagination.itemsPerPage, debouncedSearch, actionFilter, debouncedTableName, startDate, endDate]
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', queryParams],
    queryFn: () => auditLogService.getAuditLogs(queryParams),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const columns: Column<AuditLog>[] = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Thời gian',
        width: '180px',
        render: (log) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{formatDateTime(log.timestamp)}</span>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'performedBy',
        header: 'Người thực hiện',
        width: '200px',
        render: (log) => (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={log.performedBy.avatar || undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(log.performedBy.fullName || log.performedBy.username)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{log.performedBy.fullName || log.performedBy.username}</span>
              <span className="text-xs text-muted-foreground">{log.performedBy.email || log.performedBy.username}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'action',
        header: 'Hành động',
        width: '120px',
        render: (log) => (
          <Badge className={cn('text-xs', actionBadgeVariants[log.action] || 'bg-gray-50 text-gray-700')}>
            {actionLabels[log.action] || log.action}
          </Badge>
        ),
        sortable: true,
      },
      {
        key: 'tableName',
        header: 'Bảng',
        width: '150px',
        render: (log) => (
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono">{log.tableName}</span>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'recordId',
        header: 'ID bản ghi',
        width: '150px',
        render: (log) => (
          <span className="text-sm font-mono text-muted-foreground">
            {log.recordId ? log.recordId.substring(0, 8) + '...' : '—'}
          </span>
        ),
      },
      {
        key: 'ipAddress',
        header: 'IP Address',
        width: '130px',
        render: (log) => (
          <span className="text-sm font-mono text-muted-foreground">{log.ipAddress || '—'}</span>
        ),
      },
      {
        key: 'actions',
        header: 'Thao tác',
        width: '100px',
        align: 'center',
        render: (log) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedLog(log)}
            className="h-8"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-center">
                  <Eye className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Xem chi tiết</TooltipContent>
              </Tooltip>
            </TooltipProvider>  
          </Button>
        ),
      },
    ],
    []
  )

  const paginationConfig: PaginationConfig | undefined = useMemo(() => {
    if (!data?.meta?.pagination) return undefined

    return {
      currentPage: data.meta.pagination.page,
      totalPages: data.meta.pagination.totalPages,
      totalItems: data.meta.pagination.total,
      itemsPerPage: pagination.itemsPerPage,
      onPageChange: pagination.setCurrentPage,
      onItemsPerPageChange: pagination.setItemsPerPage,
      showItemsPerPage: true,
      showPageInfo: true,
    }
  }, [data?.meta?.pagination, pagination])

  const handleResetFilters = () => {
    setSearchValue('')
    setActionFilter('all')
    setTableNameFilter('')
    setStartDate('')
    setEndDate('')
  }

  const hasActiveFilters = actionFilter !== 'all' || tableNameFilter || startDate || endDate

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-muted-foreground mt-1">Theo dõi và kiểm tra các hoạt động trong hệ thống</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Collapsible open={filterOpen} onOpenChange={setFilterOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Bộ lọc
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {[actionFilter !== 'all' ? 1 : 0, tableNameFilter ? 1 : 0, startDate || endDate ? 1 : 0].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                  <ChevronDown className={cn('h-4 w-4 ml-2 transition-transform', filterOpen && 'rotate-180')} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label>Tìm kiếm</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Tìm kiếm..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hành động</Label>
                    <Select value={actionFilter} onValueChange={(value) => setActionFilter(value as QueryAuditLogParams['action'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hành động" />
                      </SelectTrigger>
                      <SelectContent>
                        {actionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value || 'all'}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tên bảng</Label>
                    <Input
                      placeholder="VD: users, classes..."
                      value={tableNameFilter}
                      onChange={(e) => setTableNameFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ngày kết thúc</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <Button variant="outline" onClick={handleResetFilters} className="w-full">
                      Đặt lại
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data?.data || []}
            columns={columns}
            loading={isLoading}
            error={isError ? 'Có lỗi xảy ra khi tải dữ liệu' : null}
            onRetry={() => refetch()}
            emptyMessage="Không có audit log nào"
            pagination={paginationConfig}
            rowKey="id"
            hoverable
            striped
          />
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết Audit Log</DialogTitle>
            <DialogDescription>Thông tin chi tiết về hoạt động này</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Thời gian</Label>
                  <p className="font-medium">{formatDateTime(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Hành động</Label>
                  <Badge className={cn('mt-1', actionBadgeVariants[selectedLog.action] || 'bg-gray-50 text-gray-700')}>
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Bảng</Label>
                  <p className="font-medium font-mono">{selectedLog.tableName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">ID bản ghi</Label>
                  <p className="font-medium font-mono">{selectedLog.recordId || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-medium font-mono">{selectedLog.ipAddress || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="font-medium text-sm break-all">{selectedLog.userAgent || '—'}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground mb-2 block">Người thực hiện</Label>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedLog.performedBy.avatar || undefined} />
                    <AvatarFallback>
                      {getInitials(selectedLog.performedBy.fullName || selectedLog.performedBy.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedLog.performedBy.fullName || selectedLog.performedBy.username}</p>
                    <p className="text-sm text-muted-foreground">{selectedLog.performedBy.email || selectedLog.performedBy.username}</p>
                    <Badge variant="outline" className="mt-1">{selectedLog.performedBy.role}</Badge>
                  </div>
                </div>
              </div>

              {selectedLog.oldValues && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Giá trị cũ</Label>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                    {JSON.stringify(selectedLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Giá trị mới</Label>
                  <pre className="p-4 bg-muted rounded-lg overflow-auto text-sm">
                    {JSON.stringify(selectedLog.newValues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
