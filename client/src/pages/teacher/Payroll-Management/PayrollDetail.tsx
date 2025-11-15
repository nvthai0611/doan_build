import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPayrollDetail } from '../../../services/teacher/payroll-management/payroll-management'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import PayrollStatusBadge from './components/PayrollStatusBadge'
import { toast } from 'sonner'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const PayrollDetailTeacher: React.FC = () => {
  const { payrollId } = useParams<{ payrollId: string }>()
  const navigate = useNavigate()
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // ✅ Fetch payroll detail với filters
  const { 
    data: response, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['payroll-detail', payrollId, selectedClass, currentPage, itemsPerPage],
    queryFn: () => getPayrollDetail(payrollId!, {
      classId: selectedClass === 'all' ? undefined : selectedClass,
      page: currentPage,
      limit: itemsPerPage
    }),
    enabled: !!payrollId,
    staleTime: 30000
  })

  // ✅ Extract data từ response
  const payroll = response?.data?.payroll
  const sessions = response?.data?.sessions || []
  const pagination = response?.data?.pagination
  const summary = response?.data?.summary

  // ✅ Get unique classes cho filter
  const uniqueClasses = useMemo(() => {
    if (!sessions || sessions.length === 0) return []
    
    const classMap = new Map()
    sessions.forEach((session: any) => {
      const cls = session.session?.class
      if (cls && !classMap.has(cls.id)) {
        classMap.set(cls.id, cls)
      }
    })
    
    return Array.from(classMap.values())
  }, [sessions])

  // ✅ Handle filter change
  const handleClassFilterChange = (classId: string) => {
    setSelectedClass(classId)
    setCurrentPage(1) // Reset về trang 1 khi filter
  }

  // ✅ Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }

  // ✅ Handle approve/reject
  const handleApprove = () => {
    // TODO: Implement approve API
    toast.success('Đã duyệt bảng lương thành công')
  }

  const handleReject = () => {
    // TODO: Implement reject API
    toast.error('Đã từ chối bảng lương')
  }

  // ✅ DataTable columns
  const columns: Column<any>[] = [
    {
      key: 'sessionDate',
      header: 'Ngày dạy',
      width: '120px',
      render: (payout) => (
        <span className="font-medium">
          {new Date(payout.session.sessionDate).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'time',
      header: 'Giờ học',
      width: '150px',
      render: (payout) => (
        <span className="text-sm text-gray-600">
          {payout.session.startTime} - {payout.session.endTime}
        </span>
      )
    },
    {
      key: 'class',
      header: 'Lớp học',
      width: '200px',
      render: (payout) => (
        <div className="flex flex-col">
          <span className="font-medium">{payout.session.class.name}</span>
          <span className="text-xs text-gray-500">{payout.session.class.classCode}</span>
        </div>
      )
    },
    {
      key: 'isSubstitute',
      header: 'Loại',
      width: '120px',
      align: 'center',
      render: (payout) => {
        // ✅ Kiểm tra dạy thay từ ClassSession
        const isSubstitute = payout.session.substituteTeacherId === payroll?.teacherId
        return (
          <Badge variant={isSubstitute ? 'secondary' : 'default'}>
            {isSubstitute ? 'Dạy thay' : 'Chính thức'}
          </Badge>
        )
      }
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      align: 'center',
      render: (payout) => {
        const statusMap: any = {
          completed: { label: 'Hoàn thành', icon: CheckCircle, color: 'text-green-600' },
          cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600' },
          pending: { label: 'Chờ xử lý', icon: Clock, color: 'text-yellow-600' }
        }
        
        const statusInfo = statusMap[payout.session.status] || statusMap.pending
        const Icon = statusInfo.icon
        
        return (
          <div className="flex items-center justify-center gap-1">
            <Icon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-xs ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        )
      }
    },
    {
      key: 'teacherPayout',
      header: 'Thanh toán',
      width: '150px',
      align: 'right',
      render: (payout) => (
        <span className="font-semibold text-green-600">
          {Number(payout.teacherPayout).toLocaleString('vi-VN')} đ
        </span>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !payroll) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Không thể tải dữ liệu
          </h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Đã có lỗi xảy ra'}
          </p>
          <Button onClick={() => refetch()}>
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  const canApproveOrReject = payroll.status === 'waiting_teacher_approval'

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">       
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết bảng lương
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kỳ lương: {new Date(payroll.periodStart).toLocaleDateString('vi-VN')} - {new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canApproveOrReject && (
            <>
              <Button
                variant="destructive"
                onClick={handleReject}
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Từ chối
              </Button>
              <Button
                variant="default"
                onClick={handleApprove}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Xác nhận duyệt
              </Button>
            </>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Tải xuống
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/teacher/payroll-management')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Quản lý lương của tôi
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Chi tiết bảng lương
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600 mb-1">Tổng lương</p>
          <p className="text-2xl font-bold text-green-600">
            {Number(payroll.totalAmount).toLocaleString('vi-VN')} đ
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600 mb-1">Thưởng</p>
          <p className="text-2xl font-bold text-blue-600">
            +{Number(payroll.bonuses).toLocaleString('vi-VN')} đ
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600 mb-1">Khấu trừ</p>
          <p className="text-2xl font-bold text-red-600">
            -{Number(payroll.deductions).toLocaleString('vi-VN')} đ
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
          <div className="mt-2">
            <PayrollStatusBadge status={payroll.status} />
          </div>
        </div>
      </div>

      {/* Session Summary - Từ Backend */}
      {summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">Tổng buổi học</p>
              <p className="text-xl font-bold text-blue-900">{summary.totalSessions}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Buổi chính thức</p>
              <p className="text-xl font-bold text-blue-900">{summary.regularSessions}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Buổi dạy thay</p>
              <p className="text-xl font-bold text-blue-900">{summary.substituteSessions}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">Tổng thanh toán</p>
              <p className="text-xl font-bold text-green-600">
                {summary.totalPayout.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            Lọc theo lớp học:
          </label>
          <Select
            value={selectedClass}
            onValueChange={handleClassFilterChange}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Chọn lớp học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp học</SelectItem>
              {uniqueClasses.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.classCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedClass !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleClassFilterChange('all')}
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Sessions Table */}
      <DataTable
        data={sessions}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        onRetry={refetch}
        emptyMessage="Không có buổi học nào"
        hoverable
        striped
        pagination={{
          currentPage: pagination?.currentPage || 1,
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.totalItems || 0,
          itemsPerPage: pagination?.itemsPerPage || 10,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange,
          showItemsPerPage: true,
          showPageInfo: true
        }}
      />
    </div>
  )
}

export default PayrollDetailTeacher