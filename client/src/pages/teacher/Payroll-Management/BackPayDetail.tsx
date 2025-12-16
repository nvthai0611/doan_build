import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPayrollDetail } from '../../../services/teacher/payroll-management/payroll-management.service'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Download, Filter, X, GraduationCap, User, Wallet, Eye, Loader2, Calendar } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import BackPayDetailModal from '../../manager/Payroll-teacher-management/components/BackPayDetailModal'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// --- Interface khớp với API Backend ---
export interface BackPayItem {
  description: string
  sessionDate: string
  payoutAmount: number
  payoutRate: number
  revenuePerSession?: number
  revenueBase?: number
  feeRecordId?: string
  source?: {
    type: string
    feeRecordId: string
    monthDebt: string
  }
  student?: {
    id: string
    code: string
    name: string
  }
  class?: {
    id: string
    name: string
    code: string
  }
}

const BackPayDetail: React.FC = () => {
  const { payrollId } = useParams<{ payrollId: string }>()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // State cho Modal
  const [selectedItem, setSelectedItem] = useState<BackPayItem | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Filters
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(undefined)
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(undefined)
  const [classFilter, setClassFilter] = useState<string>('all')

  // --- Gọi API ---
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['payroll-backpay', payrollId],
    queryFn: () => getPayrollDetail(payrollId!),
    enabled: !!payrollId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })

  // Cấu trúc dữ liệu từ API
  const payroll = response?.data?.payroll
  const allBackPayDetails: BackPayItem[] = payroll?.computedDetails?.backPayDetails || []
  const metadata = payroll?.computedDetails?.metadata
  const backPayAmount = Number(payroll?.backPayAmount || 0)

  const fmt = (n?: number) => Number(n || 0).toLocaleString('vi-VN')
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // Giới hạn date picker trong khoảng kỳ lương hiện tại
  const periodStartDate = useMemo(() => {
    if (!payroll?.periodStart) return undefined
    return new Date(payroll.periodStart)
  }, [payroll?.periodStart])

  const periodEndDate = useMemo(() => {
    if (!payroll?.periodEnd) return undefined
    return new Date(payroll.periodEnd)
  }, [payroll?.periodEnd])

  // Lấy danh sách lớp unique để filter
  const uniqueClasses = useMemo(() => {
    const classMap = new Map<string, { id: string; name: string }>()
    allBackPayDetails.forEach((item) => {
      if (item.class && !classMap.has(item.class.id)) {
        classMap.set(item.class.id, {
          id: item.class.id,
          name: item.class.name,
        })
      }
    })
    return Array.from(classMap.values())
  }, [allBackPayDetails])

  // --- Logic Lọc Dữ Liệu ---
  const filteredRows = useMemo(() => {
    let filtered = [...allBackPayDetails]

    // Filter by date range
    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.sessionDate)
        const isAfterStart = !startDateFilter || itemDate >= startDateFilter
        const isBeforeEnd = !endDateFilter || itemDate <= endDateFilter
        return isAfterStart && isBeforeEnd
      })
    }

    // Filter by class
    if (classFilter && classFilter !== 'all') {
      filtered = filtered.filter((item) => item.class?.id === classFilter)
    }

    return filtered
  }, [allBackPayDetails, startDateFilter, endDateFilter, classFilter])

  const handleExport = () => {
    console.log('Export back pay details')
  }

  const handleViewDetail = (item: BackPayItem) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDateFilter(date)
    setCurrentPage(1)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDateFilter(date)
    setCurrentPage(1)
  }

  const handleClassChange = (classId: string) => {
    setClassFilter(classId)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setStartDateFilter(undefined)
    setEndDateFilter(undefined)
    setClassFilter('all')
    setCurrentPage(1)
  }
  

  const hasActiveFilters = startDateFilter || endDateFilter || classFilter !== 'all'
  const periodLabel = `${formatDate(payroll?.periodStart)} - ${formatDate(payroll?.periodEnd)}`

  // --- Cấu hình Cột cho DataTable ---
  const columns: Column<BackPayItem>[] = [
    {
      key: 'sessionDate',
      header: 'Ngày ghi nhận',
      width: '120px',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {new Date(item.sessionDate).toLocaleDateString('vi-VN')}
          </span>
          <span className="text-[11px] text-gray-500">Ngày thu tiền</span>
        </div>
      )
    },

    {
      key: 'description',
      header: 'Nội dung',
      width: '280px',
      render: (item) => (
        <div>
          <p className="text-sm text-gray-700 line-clamp-2" title={item.description}>
            {item.description}
          </p>
          {item.source?.monthDebt && (
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-200 text-red-600 bg-red-50">
                Kỳ nợ: {new Date(item.source.monthDebt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </Badge>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'revenueBase',
      header: 'Tổng nợ thu được',
      width: '140px',
      render: (item) => (
        <div className="flex flex-col ">
          <span className="text-sm text-gray-600">
            {fmt(item.revenueBase || item.revenuePerSession)} đ
          </span>
          <span className="text-[10px] text-gray-400">Hóa đơn gốc</span>
        </div>
      )
    },
    {
      key: 'payoutRate',
      header: 'Tỷ lệ',
      width: '80px',
      render: (item) => (
        <div className="flex ">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
            {(Number(item.payoutRate) * 100).toFixed(0)}%
          </Badge>
        </div>
      )
    },
    {
      key: 'payoutAmount',
      header: 'Thực nhận',
      width: '140px',
      render: (item) => (
        <div className="flex flex-col ">
          <span className="font-bold text-green-600">
            +{fmt(item.payoutAmount)} đ
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '50px',
      render: (item) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewDetail(item)}>
          <Eye className="w-4 h-4 text-gray-500" />
        </Button>
      )
    }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    )
  }

  if (error || !payroll) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-12">
          <p className="text-red-600 font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }
  

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Chi tiết lương (buổi học cũ)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kỳ lương hiện tại: <span className="font-medium">{periodLabel}</span>
          </p>
        </div>
        {/* <Button onClick={handleExport} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Xuất file
        </Button> */}
      </div>

      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/teacher/payroll-management')}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Quản lý lương
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate(`/teacher/payroll-management/${payrollId}`)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Chi tiết lương
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Chi tiết buổi học cũ
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Summary Cards */}
      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
            <Wallet className="w-5 h-5" />
            Tổng quan buổi học cũ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Số khoản nợ thu được</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {metadata?.backPayCount || allBackPayDetails.length}
                </span>
                <span className="text-sm text-gray-500">khoản</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Tổng tiền nhận thêm</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  +{fmt(backPayAmount)}
                </span>
                <span className="text-sm text-gray-500">VNĐ</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Ngày xử lý</p>
              <div className="flex items-center gap-2 h-[36px]">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {metadata?.processedAt
                    ? new Date(metadata.processedAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-medium text-slate-600">Bộ lọc tìm kiếm</h2>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal w-[150px]',
                  !startDateFilter && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDateFilter ? format(startDateFilter, 'dd/MM/yyyy', { locale: vi }) : 'Từ ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDateFilter}
                onSelect={handleStartDateChange}
                initialFocus
                defaultMonth={startDateFilter ?? periodStartDate}
              />
            </PopoverContent>
          </Popover>

          {/* End Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal w-[150px]',
                  !endDateFilter && 'text-muted-foreground'
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDateFilter ? format(endDateFilter, 'dd/MM/yyyy', { locale: vi }) : 'Đến ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDateFilter}
                onSelect={handleEndDateChange}
                initialFocus
                defaultMonth={endDateFilter ?? periodStartDate}
              />
            </PopoverContent>
          </Popover>

          {/* Class Filter */}
          {/* <Select value={classFilter} onValueChange={handleClassChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Chọn lớp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>
              {uniqueClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          {/* Summary Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              Hiển thị {filteredRows.length} kết quả
            </span>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <Card className="shadow-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">
            Danh sách chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={filteredRows}
            columns={columns}
            loading={isLoading}
            emptyMessage="Không tìm thấy khoản truy lĩnh nào phù hợp"
            hoverable
            striped
            pagination={{
              currentPage,
              totalPages: Math.ceil(filteredRows.length / itemsPerPage),
              totalItems: filteredRows.length,
              itemsPerPage,
              onPageChange: (page) => setCurrentPage(page),
              onItemsPerPageChange: (limit) => {
                setItemsPerPage(limit)
                setCurrentPage(1)
              },
              showItemsPerPage: true,
              showPageInfo: true
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <BackPayDetailModal
        data={{...selectedItem, revenueBase: selectedItem?.revenuePerSession}}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default BackPayDetail