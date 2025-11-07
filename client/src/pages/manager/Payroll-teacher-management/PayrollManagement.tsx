import { useQuery } from '@tanstack/react-query'
import { payrollService } from '../../../services/center-owner/payroll-teacher/payroll.service'
import React, { useState, useMemo, useEffect } from 'react'
import { DataTable, Column } from '../../../components/common/Table/DataTable'
import { Eye, CheckCircle, XCircle, Clock, Search, X, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/assets/shadcn-ui/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  }
  payrolls: Payroll[]
  payrollPayments: any[]
}

interface Payroll {
  id: string
  teacherId: string
  periodStart: string
  periodEnd: string
  totalAmount: number
  status: string
  adminPublishedAt: string | null
  teacherActionAt: string | null
}

/**
 * Custom hook for debouncing values
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 */
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
  const [teacherName, setTeacherName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [month, setMonth] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Debounced values for search inputs
  const debouncedTeacherName = useDebounce(teacherName, 500)
  const debouncedEmail = useDebounce(email, 500)

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const options = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const label = new Intl.DateTimeFormat('vi-VN', { 
        month: 'long', 
        year: 'numeric' 
      }).format(date)
      options.push({ value, label })
    }
    
    return options
  }, [])

  // Use debounced values in query
  const { data: listTeacher, isLoading, error, refetch } = useQuery({
    queryKey: ['payrollTeachers', debouncedTeacherName, debouncedEmail, status, month],
    queryFn: () => payrollService.getListTeacher(debouncedTeacherName, debouncedEmail, status, month),
    staleTime: 30000,
    retry: 1
  })

  const getPayrollStatus = (teacher: Teacher) => {
    if (!teacher.payrolls || teacher.payrolls.length === 0) {
      return { label: 'Chưa có lương', variant: 'secondary' as const, icon: Clock }
    }

    const latestPayroll = teacher.payrolls[0]
    
    switch (latestPayroll.status) {
      case 'pending':
        return { label: 'Chờ xử lý', variant: 'warning' as const, icon: Clock }
      case 'waiting_teacher_approval':
        return { label: 'Chờ GV duyệt', variant: 'default' as const, icon: Clock }
      case 'rejected_by_teacher':
        return { label: 'GV từ chối', variant: 'destructive' as const, icon: XCircle }
      case 'approved_by_teacher':
        return { label: 'GV đã duyệt', variant: 'success' as const, icon: CheckCircle }
      case 'paid':
        return { label: 'Đã thanh toán', variant: 'success' as const, icon: CheckCircle }
      case 'cancelled':
        return { label: 'Đã hủy', variant: 'secondary' as const, icon: XCircle }
      default:
        return { label: 'Không xác định', variant: 'secondary' as const, icon: Clock }
    }
  }

  const getEmailStatus = (teacher: Teacher) => {
    if (!teacher.payrolls || teacher.payrolls.length === 0) {
      return { sent: false, date: null }
    }
    const latestPayroll = teacher.payrolls[0]
    return {
      sent: !!latestPayroll.adminPublishedAt,
      date: latestPayroll.adminPublishedAt
    }
  }

  const getConfirmStatus = (teacher: Teacher) => {
    if (!teacher.payrolls || teacher.payrolls.length === 0) {
      return { confirmed: false, date: null }
    }
    const latestPayroll = teacher.payrolls[0]
    return {
      confirmed: latestPayroll.status === 'approved_by_teacher' || latestPayroll.status === 'paid',
      date: latestPayroll.teacherActionAt
    }
  }

  const handleClearFilters = () => {
    setTeacherName('')
    setEmail('')
    setStatus('')
    setMonth('')
    setCurrentPage(1)
  }

  const columns: Column<Teacher>[] = [
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
      key: 'payrollCount',
      header: 'Số bảng lương',
      width: '120px',
      align: 'center',
      render: (teacher) => (
        <span className="font-medium">{teacher.payrolls?.length || 0}</span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '150px',
      render: (teacher) => {
        const statusInfo = getPayrollStatus(teacher)
        const Icon = statusInfo.icon
        return (
          <Badge variant={statusInfo.variant} className="gap-1">
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
          <XCircle className="w-5 h-5 text-gray-400" />
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
          <XCircle className="w-5 h-5 text-gray-400" />
        )
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '100px',
      align: 'center',
      render: (teacher) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetail(teacher)}
          className="gap-1"
        >
          <Eye className="w-4 h-4" />
          Xem
        </Button>
      )
    }
  ]

  const handleViewDetail = (teacher: Teacher) => {
    console.log('View detail:', teacher)
    // TODO: Navigate to detail page or open modal
  }

  const paginatedData = useMemo(() => {
    if (!listTeacher) return []
    const startIndex = (currentPage - 1) * itemsPerPage
    return listTeacher.slice(startIndex, startIndex + itemsPerPage)
  }, [listTeacher, currentPage, itemsPerPage])

  const totalPages = Math.ceil((listTeacher?.length || 0) / itemsPerPage)

  const hasActiveFilters = teacherName || email || status || month

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý lương giáo viên</h1>
        <p className="text-sm text-gray-600 mt-1">
          Quản lý và theo dõi bảng lương của giáo viên
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Teacher Name Search */}
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

          {/* Email Search */}
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

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tháng
            </label>
            <Select
              value={month}
              onValueChange={(value) => {
                setMonth(value === 'all' ? '' : value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <SelectValue placeholder="Tất cả tháng" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
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

          {/* Clear Filters Button */}
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
    </div>
  )
}

export default PayrollManagement
