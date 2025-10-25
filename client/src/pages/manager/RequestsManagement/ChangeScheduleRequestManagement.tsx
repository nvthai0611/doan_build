import React, { useState, useEffect } from 'react'
import { DataTable, Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Eye, CheckCircle, XCircle, Clock, Filter, MoreHorizontal, User, Calendar, BookOpen } from 'lucide-react'
import { usePagination } from '../../../hooks/usePagination'
import { toast } from 'sonner'
import { requestsService, ScheduleChange } from '../../../services/manager/requests.service'
import ScheduleChangeDetailModal from './components/ScheduleChangeDetailModal'
import ConfirmationModal from './components/ConfirmationModal'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}

export default function ChangeScheduleRequestManagement() {
  const [requests, setRequests] = useState<ScheduleChange[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<ScheduleChange | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const {
    currentPage,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
  } = usePagination()

  useEffect(() => {
    fetchRequests()
  }, [currentPage, statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await requestsService.getScheduleChanges({
        status: statusFilter === 'all' ? undefined : statusFilter,
        page: currentPage,
        limit: itemsPerPage
      })
      
      
      // Handle response structure
      if (response) {
        setRequests(response.data)
        setTotalItems(response.meta?.total || response.data.length)
        setTotalPages(response.meta?.totalPages || 1)
      } else {
        setRequests([])
        setTotalItems(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error('Error fetching schedule changes:', error)
      setRequests([])
      setTotalItems(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (id: string) => {
    setSelectedRequest(requests.find(r => r.id === id) || null)
    setConfirmationAction('approve')
    setIsConfirmationModalOpen(true)
  }

  const handleReject = (id: string) => {
    setSelectedRequest(requests.find(r => r.id === id) || null)
    setConfirmationAction('reject')
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !confirmationAction) return

    setIsProcessing(true)
    try {
      if (confirmationAction === 'approve') {
        await requestsService.approveScheduleChange(selectedRequest.id, 'approve')
        toast.success('Đã duyệt yêu cầu đổi lịch')
      } else if (confirmationAction === 'reject') {
        await requestsService.approveScheduleChange(selectedRequest.id, 'reject')
        toast.success('Đã từ chối yêu cầu đổi lịch')
      }
      
      await fetchRequests()
      setIsDetailModalOpen(false)
      setIsConfirmationModalOpen(false)
    } catch (error) {
      console.error(`Error ${confirmationAction}ing schedule change:`, error)
      toast.error(`Có lỗi xảy ra khi ${confirmationAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewDetails = async (id: string) => {
    try {
      const request = await requestsService.getScheduleChangeById(id)
      setSelectedRequest(request)
      setIsDetailModalOpen(true)
    } catch (error) {
      console.error('Error fetching request details:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const columns: Column<ScheduleChange>[] = [
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (item: ScheduleChange) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(item.class?.teacher?.user?.fullName || 'U').split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{item.class?.teacher?.user?.fullName || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{item.class?.teacher?.user?.email || 'No email'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'class',
      header: 'Lớp học',
      render: (item: ScheduleChange) => (
        <div className="text-sm">
          <p className="font-medium">{item.class?.name || 'Unknown'}</p>
          <p className="text-muted-foreground">{item.class?.subject?.name || 'Unknown'}</p>
        </div>
      )
    },
    {
      key: 'scheduleChange',
      header: 'Thay đổi lịch',
      render: (item: ScheduleChange) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded text-xs">
              <p className="font-medium">{formatDate(item.originalDate)}</p>
              <p className="text-muted-foreground">{item.originalTime}</p>
            </div>
            <span className="text-muted-foreground">→</span>
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs border border-green-200 dark:border-green-800">
              <p className="font-medium">{formatDate(item.newDate)}</p>
              <p className="text-muted-foreground">{item.newTime}</p>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (item: ScheduleChange) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={item.reason}>
            {item.reason}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: ScheduleChange) => (
        <Badge
          variant="secondary"
          className={statusColors[item.status] || statusColors.pending}
        >
          {getStatusIcon(item.status)}
          {statusLabels[item.status] || item.status}
        </Badge>
      )
    },
    {
      key: 'requestedAt',
      header: 'Ngày yêu cầu',
      render: (item: ScheduleChange) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(item.requestedAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item: ScheduleChange) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(item.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {item.status === 'pending' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleApprove(item.id)}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Duyệt yêu cầu
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleReject(item.id)}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý yêu cầu đổi lịch</h1>
          <p className="text-muted-foreground">
            Duyệt và quản lý các yêu cầu đổi lịch của giáo viên
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Trạng thái:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={requests}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage: currentPage,
              totalPages: totalPages,
              totalItems: totalItems,
              itemsPerPage: itemsPerPage,
              onPageChange: goToPage,
              onItemsPerPageChange: (itemsPerPage: number) => setItemsPerPage(itemsPerPage),
              showItemsPerPage: true,
              showPageInfo: true,
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <ScheduleChangeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={confirmationAction === 'approve' ? 'Xác nhận duyệt yêu cầu' : 'Xác nhận từ chối yêu cầu'}
        message={
          confirmationAction === 'approve' 
            ? 'Bạn có chắc chắn muốn duyệt yêu cầu đổi lịch này không?' 
            : 'Bạn có chắc chắn muốn từ chối yêu cầu đổi lịch này không?'
        }
        confirmText={confirmationAction === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
        type={confirmationAction || 'approve'}
        isLoading={isProcessing}
      />
    </div>
  )
}