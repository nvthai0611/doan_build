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
import { Eye, CheckCircle, XCircle, Clock, Filter, MoreHorizontal, User, Calendar, FileText } from 'lucide-react'
import { requestsService, LeaveRequest } from '../../../services/manager/requests.service'
import LeaveRequestDetailModal from './components/LeaveRequestDetailModal'
import ConfirmationModal from './components/ConfirmationModal'
import { usePagination } from '../../../hooks/usePagination'
import { toast } from 'sonner'
import Cookies from 'js-cookie'

const requestTypeLabels = {
  sick_leave: 'Nghỉ ốm',
  personal_leave: 'Nghỉ phép',
  emergency_leave: 'Nghỉ khẩn cấp',
  other: 'Khác',
}

const requestTypeColors = {
  sick_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  personal_leave: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  emergency_leave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
}

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

export default function LeaveRequestManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const {
    currentPage,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
  } = usePagination();

  useEffect(() => {
    fetchRequests()
    // Get current user info
    const user = Cookies.get('user')
    setCurrentUser(user)
  }, [currentPage, statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await requestsService.getLeaveRequests({
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
      console.error('Error fetching leave requests:', error)
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
        await requestsService.approveLeaveRequest(selectedRequest.id, 'approve', currentUser?.id || '')
        toast.success('Đã duyệt đơn xin nghỉ phép')
      } else if (confirmationAction === 'reject') {
        await requestsService.approveLeaveRequest(selectedRequest.id, 'reject', currentUser?.id || '')
        toast.success('Đã từ chối đơn xin nghỉ phép')
      }
      
      await fetchRequests()
      setIsDetailModalOpen(false)
      setIsConfirmationModalOpen(false)
    } catch (error) {
      console.error(`Error ${confirmationAction}ing leave request:`, error)
      toast.error(`Có lỗi xảy ra khi ${confirmationAction === 'approve' ? 'duyệt' : 'từ chối'} đơn`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewDetails = async (id: string) => {
    try {
      const request = await requestsService.getLeaveRequestById(id)
      setSelectedRequest(request.data)
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

  const columns: Column<LeaveRequest>[] = [
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (item: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(item.teacher?.user?.fullName || 'U').split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{item.teacher?.user?.fullName || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{item.teacher?.user?.email || 'No email'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'requestType',
      header: 'Loại nghỉ',
      render: (item: LeaveRequest) => (
        <Badge
          variant="secondary"
          className={requestTypeColors[item.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
        >
          {requestTypeLabels[item.requestType as keyof typeof requestTypeLabels] || item.requestType}
        </Badge>
      )
    },
    {
      key: 'leavePeriod',
      header: 'Thời gian nghỉ',
      render: (item: LeaveRequest) => (
        <div className="text-sm">
          <p className="font-medium">{formatDate(item.startDate)}</p>
          <p className="text-muted-foreground">đến {formatDate(item.endDate)}</p>
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (item: LeaveRequest) => (
        <div className="max-w-xs">
          <p className="text-sm truncate" title={item.reason}>
            {item.reason}
          </p>
        </div>
      )
    },
    {
      key: 'affectedSessions',
      header: 'Sessions bị ảnh hưởng',
      render: (item: LeaveRequest) => (
        <div className="text-center">
          <span className="text-sm font-medium">
            {item.affectedSessions?.length || 0}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: LeaveRequest) => (
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
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (item: LeaveRequest) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item: LeaveRequest) => (
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
                  Duyệt đơn
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn xin nghỉ phép</h1>
          <p className="text-muted-foreground">
            Duyệt và quản lý các đơn xin nghỉ phép của giáo viên
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
      <LeaveRequestDetailModal
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
        title={confirmationAction === 'approve' ? 'Xác nhận duyệt đơn' : 'Xác nhận từ chối đơn'}
        message={
          confirmationAction === 'approve' 
            ? 'Bạn có chắc chắn muốn duyệt đơn xin nghỉ phép này không?' 
            : 'Bạn có chắc chắn muốn từ chối đơn xin nghỉ phép này không?'
        }
        confirmText={confirmationAction === 'approve' ? 'Duyệt đơn' : 'Từ chối đơn'}
        type={confirmationAction || 'approve'}
        isLoading={isProcessing}
      />
    </div>
  )
}
