import { useQuery, useMutation } from '@tanstack/react-query'
import { payrollService } from '../../../services/center-owner/payroll-teacher/payroll.service'
import React, { useState, useMemo, useEffect } from 'react'
import { DataTable, Column } from '../../../components/common/Table/DataTable'
import { Eye, CheckCircle, XCircle, Clock, Search, X, Calendar, Mail, Send, RefreshCw, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/assets/shadcn-ui/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { PayrollAdjustmentModal } from './components/PayrollAdjustmentModal'

interface Teacher {
  id: string
  userId: string
  teacherCode: string
  schoolId: string
  subjects: string[]
  createdAt: string
  updatedAt: string
  user: {
    id: string
    fullName: string
    email: string
    isActive: boolean
  }
  payroll?: {
    id: string
    periodStart: string
    periodEnd: string
    totalAmount: number
    status: string
    adminPublishedAt?: string
    teacherActionAt?: string
  }
  payrollPayment?: any
}

const useDebounce = <T,>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const PayrollManagement: React.FC = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [teacherName, setTeacherName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [month, setMonth] = useState('')
  
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const [selectedPayrollIds, setSelectedPayrollIds] = useState<string[]>([])
  
  // State cho modal điều chỉnh
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  
  const debouncedTeacherName = useDebounce(teacherName, 500)
  const debouncedEmail = useDebounce(email, 500)

  const { data: listTeacher, isLoading, error, refetch } = useQuery<Teacher[]>({
    queryKey: ['payrollTeachers', debouncedTeacherName, debouncedEmail, status, month],
    queryFn: () => payrollService.getListTeacher(debouncedTeacherName, debouncedEmail, status, month) as Promise<Teacher[]>,
    staleTime: 30000,
    retry: 1
  })

  const sendEmailMutation = useMutation({
    mutationFn: (payrollIds: string[]) => payrollService.sendPayrollNotification(payrollIds),
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: data?.message || 'Đã gửi email nhắc nhở thành công',
        variant: 'default'
      })
      setSelectedPayrollIds([])
      setTimeout(() => {
        refetch()
      }, 10000)
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Không thể gửi email',
        variant: 'destructive'
      })
    }
  })

  const recalculateMutation = useMutation({
    mutationFn: (payrollIds: string[]) => payrollService.recalculatePayrolls(payrollIds),
    onSuccess: (data) => {
      toast({
        title: 'Thành công',
        description: data?.message || 'Đã gửi yêu cầu tính toán lại lương!',
        variant: 'default'
      })
      setSelectedPayrollIds([])
      refetch()
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.response?.data?.message || 'Tính toán lại lương thất bại!',
        variant: 'destructive'
      })
    }
  })

  const getPayrollStatus = (teacher: Teacher) => {
    if (!teacher.payroll) {
      return { 
        label: 'Chưa có lương', 
        variant: 'secondary' as const, 
        icon: Clock, 
        color: 'bg-gray-200' 
      }
    }

    switch (teacher.payroll.status) {
      case 'pending':
        return { label: 'Chờ xử lý', variant: 'warning' as const, icon: Clock, color: 'bg-yellow-400' }
      case 'waiting_teacher_approval':
        return { label: 'Chờ GV duyệt', variant: 'default' as const, icon: Clock, color: 'bg-blue-400' }
      case 'rejected_by_teacher':
        return { label: 'GV từ chối', variant: 'destructive' as const, icon: XCircle, color: 'bg-red-400' }
      case 'approved_by_teacher':
        return { label: 'GV đã duyệt', variant: 'success' as const, icon: CheckCircle, color: 'bg-green-400' }
      case 'paid':
        return { label: 'Đã thanh toán', variant: 'success' as const, icon: CheckCircle, color: 'bg-green-400' }
      case 'cancelled':
        return { label: 'Đã hủy', variant: 'secondary' as const, icon: XCircle, color: 'bg-gray-400' }
      default:
        return { label: 'Không xác định', variant: 'secondary' as const, icon: Clock, color: 'bg-gray-400' }
    }
  }

  const getEmailStatus = (teacher: Teacher) => {
    if (!teacher.payroll) {
      return { sent: false, date: null }
    }
    return {
      sent: !!teacher.payroll.adminPublishedAt,
      date: teacher.payroll.adminPublishedAt
    }
  }

  const getConfirmStatus = (teacher: Teacher) => {
    if (!teacher.payroll) {
      return { confirmed: false, date: null }
    }
    return {
      confirmed: teacher.payroll.status === 'approved_by_teacher' || teacher.payroll.status === 'paid',
      date: teacher.payroll.teacherActionAt
    }
  }

  const handleClearFilters = () => {
    setTeacherName('')
    setEmail('')
    setStatus('')
    setMonth('')
    setCurrentPage(1)
  }

  const canSelectForEmail = (teacher: Teacher): boolean => {
    return teacher.payroll?.status === 'pending' || false
  }

  const canSelectForRecalculation = (teacher: Teacher): boolean => {
    return teacher.payroll?.status === 'pending' || teacher.payroll?.status === 'rejected_by_teacher' || false
  }

  // ✅ MỚI: Check nếu có thể điều chỉnh (chỉ cho pending)
  const canSelectForAdjustment = (teacher: Teacher): boolean => {
    return teacher.payroll?.status === 'pending' || false
  }

  const canSelect = (teacher: Teacher): boolean => {
    return canSelectForEmail(teacher) || canSelectForRecalculation(teacher) || canSelectForAdjustment(teacher)
  }

  const handleSelectPayroll = (payrollId: string) => {
    setSelectedPayrollIds(prev => 
      prev.includes(payrollId) 
        ? prev.filter(id => id !== payrollId)
        : [...prev, payrollId]
    )
  }

  const handleSelectAll = () => {
    if (!listTeacher) return
    
    const selectablePayrollIds = listTeacher
      .filter(teacher => canSelect(teacher))
      .map(teacher => teacher?.payroll?.id || '')
      .filter(Boolean)
    
    if (selectedPayrollIds.length === selectablePayrollIds.length && selectablePayrollIds.length > 0) {
      setSelectedPayrollIds([])
    } else {
      setSelectedPayrollIds(selectablePayrollIds)
    }
  }

  const handleSendEmail = () => {
    if (selectedPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất một bảng lương',
        variant: 'default'
      })
      return
    }

    const pendingPayrollIds = selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForEmail(teacher)
    })

    if (pendingPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Chỉ có thể gửi email cho payroll ở trạng thái "Chờ xử lý"',
        variant: 'default'
      })
      return
    }

    sendEmailMutation.mutate(pendingPayrollIds)
  }

  const handleRecalculate = () => {
    if (selectedPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất một bảng lương',
        variant: 'default'
      })
      return
    }

    const validPayrollIds = selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForRecalculation(teacher)
    })

    if (validPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Chỉ có thể tính toán lại cho payroll ở trạng thái "Chờ xử lý" hoặc "GV từ chối"',
        variant: 'default'
      })
      return
    }

    recalculateMutation.mutate(validPayrollIds)
  }

  // ✅ MỚI: Xử lý mở modal điều chỉnh
  const handleOpenAdjustmentModal = () => {
    if (selectedPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Vui lòng chọn ít nhất một bảng lương',
        variant: 'default'
      })
      return
    }

    const validPayrollIds = selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForAdjustment(teacher)
    })

    if (validPayrollIds.length === 0) {
      toast({
        title: 'Cảnh báo',
        description: 'Chỉ có thể điều chỉnh lương cho payroll ở trạng thái "Chờ xử lý"',
        variant: 'default'
      })
      return
    }

    setShowAdjustmentModal(true)
  }

  const columns: Column<Teacher>[] = [
    {
      key: 'checkbox',
      header: (
        <Checkbox
          checked={
            listTeacher && 
            listTeacher.filter(t => canSelect(t)).length > 0 &&
            selectedPayrollIds.length === listTeacher.filter(t => canSelect(t)).length
          }
          onCheckedChange={handleSelectAll}
          disabled={!listTeacher || listTeacher.filter(t => canSelect(t)).length === 0}
          aria-label="Select all"
        />
      ),
      width: '50px',
      render: (teacher) => (
        <Checkbox
          checked={selectedPayrollIds.includes(teacher?.payroll?.id || '')}
          onCheckedChange={() => handleSelectPayroll(teacher?.payroll?.id || '')}
          disabled={!canSelect(teacher)}
          aria-label={`Select ${teacher.user.fullName}`}
          title={
            !canSelect(teacher) 
              ? 'Chỉ có thể chọn payroll ở trạng thái "Chờ xử lý" hoặc "GV từ chối"' 
              : ''
          }
        />
      )
    },
    {
      key: 'teacherCode',
      header: 'Mã GV',
      width: '120px'
    },
    {
      key: 'fullName',
      header: 'Họ và tên',
      width: '200px',
      render: (teacher) => teacher.user.fullName
    },
    {
      key: 'email',
      header: 'Email',
      width: '250px',
      render: (teacher) => (
        <span className="text-sm text-gray-600">{teacher.user.email}</span>
      )
    },
    {
      key: 'subjects',
      header: 'Môn dạy',
      width: '200px',
      render: (teacher) => (
        <div className="flex flex-wrap gap-1">
          {teacher.subjects.slice(0, 2).map((subject, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {subject}
            </Badge>
          ))}
          {teacher.subjects.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{teacher.subjects.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '150px',
      render: (teacher) => {
        const statusInfo = getPayrollStatus(teacher)
        const Icon = statusInfo.icon
        const isSelectable = canSelect(teacher)
        
        return (
          <Badge 
            variant={statusInfo.variant} 
            className={`gap-1 ${statusInfo.color} ${isSelectable ? 'ring-2 ring-blue-400' : ''}`}
          >
            <Icon className="w-3 h-3" />
            {statusInfo.label}
          </Badge>
        )
      }
    },
    {
      key: 'emailSent',
      header: 'Đã gửi email',
      width: '120px',
      align: 'center',
      render: (teacher) => {
        const emailStatus = getEmailStatus(teacher)
        return emailStatus.sent ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {emailStatus.date && (
              <span className="text-xs text-gray-500">
                {new Date(emailStatus.date).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <XCircle className="w-5 h-5 text-gray-400" />
          </div>
        )
      }
    },
    {
      key: 'confirmed',
      header: 'Đã xác nhận',
      width: '120px',
      align: 'center',
      render: (teacher) => {
        const confirmStatus = getConfirmStatus(teacher)
        return confirmStatus.confirmed ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="w-5 h-5 text-green-600" />
            {confirmStatus.date && (
              <span className="text-xs text-gray-500">
                {new Date(confirmStatus.date).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <XCircle className="w-5 h-5 text-gray-400" />
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '100px',
      render: (teacher) => (
        <>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(teacher)}
          className="gap-1"
        >
          <Eye className="w-4 h-4" />
          Xem chi tiết
        </Button>

        {/* <div>
          <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(teacher)}
          className="gap-1"
        >
          <Eye className="w-4 h-4" />
          Xem Tổng Quan
        </Button>
        </div> */}
        </>

        
      )
    }
  ]

  const handleViewDetail = (teacher: Teacher) => {
    navigate(`/center-qn/payroll-teacher/payroll/${teacher?.payroll?.id}`)
  }

  const paginatedData = useMemo(() => {
    if (!listTeacher) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    return listTeacher.slice(startIndex, startIndex + itemsPerPage)
  }, [listTeacher, currentPage, itemsPerPage])

  const totalPages = Math.ceil((listTeacher?.length || 0) / itemsPerPage)

  const hasActiveFilters = teacherName || email || status || month

  const selectedForEmailCount = useMemo(() => {
    return selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForEmail(teacher)
    }).length
  }, [selectedPayrollIds, listTeacher])

  const selectedForRecalculationCount = useMemo(() => {
    return selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForRecalculation(teacher)
    }).length
  }, [selectedPayrollIds, listTeacher])

  // ✅ MỚI: Đếm số payroll có thể điều chỉnh
  const selectedForAdjustmentCount = useMemo(() => {
    return selectedPayrollIds.filter(id => {
      const teacher = listTeacher?.find(t => t.payroll?.id === id)
      return teacher && canSelectForAdjustment(teacher)
    }).length
  }, [selectedPayrollIds, listTeacher])

  // ✅ MỚI: Lấy data các payroll đã chọn
  const selectedPayrollsData = useMemo(() => {
    return selectedPayrollIds
      .map(id => {
        const teacher = listTeacher?.find(t => t.payroll?.id === id)
        return teacher?.payroll ? { ...teacher.payroll, teacher } : null
      })
      .filter(Boolean)
  }, [selectedPayrollIds, listTeacher])

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lương giáo viên</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý và theo dõi bảng lương của giáo viên
          </p>
        </div>
      </div>

      {/* Action Bar */}
      {selectedPayrollIds.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Đã chọn {selectedPayrollIds.length} bảng lương
              </span>
              {selectedForEmailCount > 0 && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {selectedForEmailCount} có thể gửi email
                </Badge>
              )}
              {selectedForRecalculationCount > 0 && (
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  {selectedForRecalculationCount} có thể tính lại
                </Badge>
              )}
              {selectedForAdjustmentCount > 0 && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                  {selectedForAdjustmentCount} có thể điều chỉnh
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending || selectedForEmailCount === 0}
                className="bg-white gap-2"
              >
                <Mail className="w-4 h-4" />
                {sendEmailMutation.isPending ? 'Đang gửi...' : `Gửi Email (${selectedForEmailCount})`}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                disabled={recalculateMutation.isPending || selectedForRecalculationCount === 0}
                className="bg-white gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {recalculateMutation.isPending ? 'Đang tính...' : `Tính toán lại (${selectedForRecalculationCount})`}
              </Button>

              {/* ✅ MỚI: Nút điều chỉnh lương */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAdjustmentModal}
                disabled={selectedForAdjustmentCount === 0}
                className="bg-white gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Điều chỉnh lương ({selectedForAdjustmentCount})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          <p className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              <strong>Gửi Email:</strong> Chỉ cho bảng lương <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mx-1">Chờ xử lý</Badge>
              <br />
              <strong>Tính toán lại:</strong> Cho bảng lương <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mx-1">Chờ xử lý</Badge> 
              hoặc <Badge variant="outline" className="bg-red-100 text-red-800 mx-1">GV từ chối</Badge>
              <br />
              <strong>Điều chỉnh lương:</strong> Chỉ cho bảng lương <Badge variant="outline" className="bg-yellow-100 text-yellow-800 mx-1">Chờ xử lý</Badge>
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên giáo viên
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập tên giáo viên..."
                value={teacherName}
                onChange={(e) => {
                  setTeacherName(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-10"
              />
              {teacherName && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTeacherName('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Nhập email..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-10"
              />
              {email && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEmail('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tháng
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-10"
                max={new Date().toISOString().slice(0, 7)}
              />
              {month && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMonth('')
                    setCurrentPage(1)
                  }}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="waiting_teacher_approval">Chờ GV duyệt</SelectItem>
                <SelectItem value="approved_by_teacher">GV đã duyệt</SelectItem>
                <SelectItem value="rejected_by_teacher">GV từ chối</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="cancelled">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={paginatedData}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        onRetry={refetch}
        emptyMessage="Không có dữ liệu giáo viên"
        hoverable
        pagination={{
          currentPage,
          totalPages,
          totalItems: listTeacher?.length || 0,
          itemsPerPage,
          onPageChange: setCurrentPage,
          onItemsPerPageChange: (value) => {
            setItemsPerPage(value)
            setCurrentPage(1)
          },
          showItemsPerPage: true,
          showPageInfo: true
        }}
        enableSearch={false}
        enableSort={false}
      />

      {/* ✅ MỚI: Modal điều chỉnh lương */}
      <PayrollAdjustmentModal
        open={showAdjustmentModal}
        onOpenChange={setShowAdjustmentModal}
        selectedPayrolls={selectedPayrollsData as any}
      />
    </div>
  )
}

export default PayrollManagement
