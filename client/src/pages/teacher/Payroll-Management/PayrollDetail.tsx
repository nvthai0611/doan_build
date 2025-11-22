import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  FileText,
  Download,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Minus,
  DollarSign
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { 
  getPayrollDetail, 
  approvePayroll, 
  rejectPayroll 
} from '../../../services/teacher/payroll-management/payroll-management.service'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import PayrollApprovalDialog from './components/PayrollApprovalDialog'
import PayrollRejectDialog from './components/PayrollRejectDialog'
import PayrollStatusBadge from './components/PayrollStatusBadge'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/assets/shadcn-ui/components/ui/breadcrumb'
import { cn } from '@/lib/utils'

const PayrollDetailTeacher: React.FC = () => {
  const { payrollId } = useParams<{ payrollId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)

  // ✅ Fetch payroll detail
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

  const payroll = response?.data?.payroll
  const sessions = response?.data?.sessions || []
  const pagination = response?.data?.pagination
  const summary = response?.data?.summary

  // ✅ Parse adjustment details
  const adjustmentDetails = useMemo(() => {
    if (!payroll?.adjustmentDetails) return []
    try {
      const details = typeof payroll.adjustmentDetails === 'string' 
        ? JSON.parse(payroll.adjustmentDetails)
        : payroll.adjustmentDetails
      return Array.isArray(details) ? details : []
    } catch (error) {
      console.error('Error parsing adjustment details:', error)
      return []
    }
  }, [payroll?.adjustmentDetails])

  // ✅ Calculate adjustment summary
  const adjustmentSummary = useMemo(() => {
    const bonuses = adjustmentDetails
      .filter((adj: any) => adj.type === 'bonus')
      .reduce((sum: number, adj: any) => sum + Number(adj.amount || 0), 0)
    
    const deductions = adjustmentDetails
      .filter((adj: any) => adj.type === 'deduction')
      .reduce((sum: number, adj: any) => sum + Number(adj.amount || 0), 0)
    
    return { bonuses, deductions, total: bonuses - deductions }
  }, [adjustmentDetails])

  // ✅ Fetch ALL sessions để lấy unique classes (không phân trang)
  const { data: allSessionsResponse } = useQuery({
    queryKey: ['payroll-all-sessions', payrollId],
    queryFn: () => getPayrollDetail(payrollId!, {
      page: 1,
      limit: 999999
    }),
    enabled: !!payrollId,
    staleTime: 60000
  })

  // ✅ Lấy unique classes từ ALL sessions
  const uniqueClasses = useMemo(() => {
    if (!allSessionsResponse?.data?.sessions) return []
    
    const classMap = new Map()
    allSessionsResponse.data.sessions.forEach((session: any) => {
      const classData = session.session?.class
      if (classData?.id && classData?.name) {
        classMap.set(classData.id, {
          id: classData.id,
          name: classData.name,
          code: classData.classCode
        })
      }
    })
    
    return Array.from(classMap.values())
  }, [allSessionsResponse])

  // ✅ Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => approvePayroll(payrollId!),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã duyệt bảng lương thành công',
        variant: 'default'
      })
      setApprovalDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['payroll-detail', payrollId] })
      queryClient.invalidateQueries({ queryKey: ['teacher-payrolls'] })
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể duyệt bảng lương',
        variant: 'destructive'
      })
    }
  })

  // ✅ Reject mutation
  const rejectMutation = useMutation({
    mutationFn: (reason: string) => rejectPayroll(payrollId!, reason),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Đã từ chối bảng lương',
        variant: 'default'
      })
      setRejectDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['payroll-detail', payrollId] })
      queryClient.invalidateQueries({ queryKey: ['teacher-payrolls'] })
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể từ chối bảng lương',
        variant: 'destructive'
      })
    }
  })

  // ✅ Format currency
  const fmt = (n?: number) => Number(n || 0).toLocaleString('vi-VN')

  // ✅ Session status badge
  const getSessionStatusBadge = (status?: string) => {
    switch (status) {
      case 'end':
        return <Badge className="bg-green-100 text-green-700">Đã kết thúc</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Đã hủy</Badge>
      case 'day_off':
        return <Badge className="bg-blue-100 text-blue-700">Nghỉ</Badge>
      case 'scheduled':
        return <Badge className="bg-slate-100 text-slate-700">Đã lên lịch</Badge>
      default:
        return <Badge variant="outline">{status || '-'}</Badge>
    }
  }

  // ✅ DataTable columns
  const columns: Column<any>[] = [
    {
      key: 'sessionDate',
      header: 'Ngày',
      width: '120px',
      render: (session) => (
        <span className="text-sm">
          {new Date(session.session?.sessionDate).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'time',
      header: 'Thời gian',
      width: '150px',
      render: (session) => (
        <span className="text-sm">
          {session.session?.startTime} - {session.session?.endTime}
        </span>
      )
    },
    {
      key: 'class',
      header: 'Lớp',
      width: '200px',
      render: (session) => (
        <div className="flex flex-col">
          <span className="font-medium">{session.session?.class?.name}</span>
          <span className="text-xs text-gray-500">
            {session.session?.class?.classCode}
          </span>
        </div>
      )
    },
    {
      key: 'notes',
      header: 'Ghi chú',
      width: '200px',
      render: (session) => (
        <span className="text-sm text-gray-600">
          {session.session?.notes || '-'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '120px',
      render: (session) => getSessionStatusBadge(session.session?.status)
    },
    {
      key: 'studentCount',
      header: 'Số HS',
      width: '80px',
      align: 'center',
      render: (session) => (
        <span className="font-medium">{session.studentCount}</span>
      )
    },
    {
      key: 'teacherPayout',
      header: 'Lương',
      width: '150px',
      align: 'right',
      render: (session) => (
        <span className="font-semibold text-green-600">
          {fmt(Number(session.teacherPayout))} đ
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '100px',
      align: 'center',
      render: (session) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/teacher/classes/session-details/${session.session?.id}`)}
          className="gap-1"
        >
          <Eye className="w-4 h-4" />
          Xem
        </Button>
      )
    }
  ]

  // ✅ Handle filter change
  const handleClassChange = (classId: string) => {
    setSelectedClass(classId)
    setCurrentPage(1)
  }

  // ✅ Render action buttons
  const renderActionButtons = () => {
    if (payroll?.status === 'waiting_teacher_approval') {
      return (
        <div className="flex gap-2">
          <Button
            onClick={() => setApprovalDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            Duyệt bảng lương
          </Button>
          <Button
            onClick={() => setRejectDialogOpen(true)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 gap-2"
          >
            <ThumbsDown className="w-4 h-4" />
            Từ chối
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết bảng lương
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Kỳ lương: {payroll?.periodStart 
              ? `${new Date(payroll.periodStart).toLocaleDateString('vi-VN')} - ${new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}`
              : '-'
            }
          </p>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => navigate('/teacher/payroll-management')}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Quản lý bảng lương
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
        </div>
        <div className="flex items-center gap-3">
          {/* ✅ SỬ DỤNG PayrollStatusBadge */}
          <PayrollStatusBadge 
            status={payroll?.status || 'pending'}
            onClickRejected={() => {
              // Có thể mở modal rejection detail nếu cần
              console.log('Rejected payroll clicked')
            }}
          />
          {renderActionButtons()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1">Lương cơ bản</p>
          <p className="text-2xl font-bold text-blue-600">
            {fmt(Number(payroll?.totalAmount || 0) - Number(payroll?.bonuses || 0) + Number(payroll?.deductions || 0))} đ
          </p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Plus className="w-3 h-3 text-green-600" />
            Thưởng
          </p>
          <p className="text-2xl font-bold text-green-600">
            +{fmt(Number(payroll?.bonuses))} đ
          </p>
          {adjustmentSummary.bonuses > 0 && (
            <p className="text-xs text-green-600 mt-1">
              ({adjustmentDetails.filter((a: any) => a.type === 'bonus').length} điều chỉnh)
            </p>
          )}
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
            <Minus className="w-3 h-3 text-red-600" />
            Khấu trừ
          </p>
          <p className="text-2xl font-bold text-red-600">
            -{fmt(Number(payroll?.deductions))} đ
          </p>
          {adjustmentSummary.deductions > 0 && (
            <p className="text-xs text-red-600 mt-1">
              ({adjustmentDetails.filter((a: any) => a.type === 'deduction').length} điều chỉnh)
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border-2 border-emerald-200 p-4">
          <p className="text-sm text-emerald-700 font-medium mb-1 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Tổng thanh toán
          </p>
          <p className="text-2xl font-bold text-emerald-900">
            {fmt(Number(payroll?.totalAmount || 0))} đ
          </p>
        </div>
      </div>

      {/* Rejection Alert */}
      {payroll?.status === 'rejected_by_teacher' && payroll?.teacherRejectionReason && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">
                Bạn đã từ chối bảng lương này
              </h3>
              <p className="text-sm text-red-700">
                <strong>Lý do:</strong> {payroll.teacherRejectionReason}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Adjustment Details Card */}
      {adjustmentDetails.length > 0 && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Chi tiết tiền thưởng & khấu trừ
            </h2>
            {/* <Badge variant="outline">
              {adjustmentDetails.length} 
            </Badge> */}
          </div>

          <div className="space-y-2">
            {adjustmentDetails.map((adj: any, index: number) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg transition-colors",
                  adj.type === 'bonus' 
                    ? "bg-green-50 border border-green-200 hover:bg-green-100" 
                    : "bg-red-50 border border-red-200 hover:bg-red-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={adj.type === 'bonus' ? 'default' : 'destructive'}
                    className="gap-1"
                  >
                    {adj.type === 'bonus' ? (
                      <Plus className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    {adj.type === 'bonus' ? 'Thưởng' : 'Khấu trừ'}
                  </Badge>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {adj.reason || 'Không có lý do'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    adj.type === 'bonus' ? "text-green-700" : "text-red-700"
                  )}>
                    {adj.type === 'bonus' ? '+' : '-'}{fmt(Number(adj.amount || 0))} đ
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Adjustment Summary */}
          <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Tổng tiền thưởng & khấu trừ:
              </span>
              <span className={cn(
                "text-lg font-bold",
                adjustmentSummary.total >= 0 ? "text-green-700" : "text-red-700"
              )}>
                {adjustmentSummary.total >= 0 ? '+' : ''}{fmt(adjustmentSummary.total)} đ
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Lọc theo lớp:
            </label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>
                {uniqueClasses.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.code ? `(${cls.code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-600">
            Hiển thị {sessions.length} / {pagination?.totalItems || 0} buổi học
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={sessions}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        onRetry={refetch}
        emptyMessage="Không có dữ liệu buổi học"
        hoverable
        striped
        pagination={{
          currentPage: pagination?.currentPage || 1,
          totalPages: pagination?.totalPages || 1,
          totalItems: pagination?.totalItems || 0,
          itemsPerPage: pagination?.itemsPerPage || 10,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (limit) => {
            setItemsPerPage(limit)
            setCurrentPage(1)
          },
          showItemsPerPage: true,
          showPageInfo: true
        }}
        enableSearch={false}
        enableSort={false}
      />

      {/* Approval Dialog */}
      <PayrollApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        onConfirm={() => approveMutation.mutate()}
        loading={approveMutation.isPending}
        payroll={payroll}
      />

      {/* Reject Dialog */}
      <PayrollRejectDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        payroll={payroll}
        onConfirm={(reason: any) => rejectMutation.mutate(reason)}
        loading={rejectMutation.isPending}
      />
    </div>
  )
}

export default PayrollDetailTeacher