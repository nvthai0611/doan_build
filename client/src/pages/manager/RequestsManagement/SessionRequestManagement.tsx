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
import { requestsService, SessionRequest } from '../../../services/manager/requests.service'
import SessionRequestDetailModal from './components/SessionRequestDetailModal'
import ConfirmationModal from './components/ConfirmationModal'
import Cookies from 'js-cookie'

const requestTypeLabels = {
  makeup_session: 'Buổi học bù',
  extra_session: 'Buổi học thêm',
}

const requestTypeColors = {
  makeup_session: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  extra_session: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
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

export default function SessionRequestManagement() {
  
  const [requests, setRequests] = useState<SessionRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<SessionRequest | null>(null)
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
  } = usePagination()

  useEffect(() => {
    fetchRequests()
    // Get current user info
    const user = Cookies.get('user')
    setCurrentUser(user)
  }, [currentPage, statusFilter])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      
      const response = await requestsService.getSessionRequests({
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
      console.error('Error fetching session requests:', error)
      setRequests([])
      setTotalItems(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id)
    setSelectedRequest(request || null)
    setConfirmationAction('approve')
    setIsConfirmationModalOpen(true)
  }

  const handleReject = (id: string) => {
    setSelectedRequest(requests.find(r => r.id === id) || null)
    setConfirmationAction('reject')
    setIsConfirmationModalOpen(true)
  }

  const handleConfirmAction = async () => {

    if (!selectedRequest || !confirmationAction) {
      return
    }

    setIsProcessing(true)
    
    try {
      if (confirmationAction === 'approve') {
        await requestsService.approveSessionRequest(selectedRequest.id, 'approve', currentUser?.id || '')
        toast.success('Đã duyệt yêu cầu tạo buổi học')
      } else if (confirmationAction === 'reject') {
        await requestsService.approveSessionRequest(selectedRequest.id, 'reject', currentUser?.id || '')
        toast.success('Đã từ chối yêu cầu tạo buổi học')
      }
      
      await fetchRequests()
      setIsDetailModalOpen(false)
      setIsConfirmationModalOpen(false)
    } catch (error) {
      console.error(`Error ${confirmationAction}ing session request:`, error)
      toast.error(`Có lỗi xảy ra khi ${confirmationAction === 'approve' ? 'duyệt' : 'từ chối'} yêu cầu`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewDetails = async (id: string) => {
    try {
      const request = await requestsService.getSessionRequestById(id)
      setSelectedRequest(request.data)
      setIsDetailModalOpen(true)
    } catch (error) {
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

  const columns: Column<SessionRequest>[] = [
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (item: SessionRequest) => (
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
      header: 'Loại yêu cầu',
      render: (item: SessionRequest) => (
        <Badge
          variant="secondary"
          className={requestTypeColors[item.requestType as keyof typeof requestTypeColors] || 'bg-gray-100 text-gray-700'}
        >
          {requestTypeLabels[item.requestType as keyof typeof requestTypeLabels] || item.requestType}
        </Badge>
      )
    },
    {
      key: 'class',
      header: 'Lớp học',
      render: (item: SessionRequest) => (
        <div className="text-sm">
          <p className="font-medium">{item.class?.name || 'Unknown'}</p>
          <p className="text-muted-foreground">{item.class?.subject?.name || 'Unknown'}</p>
        </div>
      )
    },
    {
      key: 'sessionDetails',
      header: 'Chi tiết buổi học',
      render: (item: SessionRequest) => (
        <div className="text-sm">
          <p className="font-medium">{formatDate(item.sessionDate)}</p>
          <p className="text-muted-foreground">{item.startTime} - {item.endTime}</p>
          {item.room && (
            <p className="text-xs text-muted-foreground">Phòng: {item.room.name}</p>
          )}
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (item: SessionRequest) => (
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
      render: (item: SessionRequest) => (
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
      render: (item: SessionRequest) => (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(item.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item: SessionRequest) => (
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
            {(() => {
              return item.status === 'pending'
            })() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    handleApprove(item.id)
                  }}
                  className="text-green-600"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Duyệt yêu cầu
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    handleReject(item.id)
                  }}
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
          <h1 className="text-2xl font-bold tracking-tight">Quản lý yêu cầu tạo buổi học</h1>
          <p className="text-muted-foreground">
            Duyệt và quản lý các yêu cầu tạo buổi học của giáo viên
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

      <SessionRequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
        onApprove={(id) => {
          handleApprove(id)
        }}
        onReject={(id) => {
          handleReject(id)
        }}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => {
          setIsConfirmationModalOpen(false)
        }}
        onConfirm={handleConfirmAction}
        title={confirmationAction === 'approve' ? 'Xác nhận duyệt yêu cầu' : 'Xác nhận từ chối yêu cầu'}
        message={
          confirmationAction === 'approve' 
            ? 'Bạn có chắc chắn muốn duyệt yêu cầu tạo buổi học này không?' 
            : 'Bạn có chắc chắn muốn từ chối yêu cầu tạo buổi học này không?'
        }
        confirmText={confirmationAction === 'approve' ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu'}
        type={confirmationAction || 'approve'}
        isLoading={isProcessing}
      />
    </div>
  )
}