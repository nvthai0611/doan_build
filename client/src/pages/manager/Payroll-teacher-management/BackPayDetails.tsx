import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPayrollDetail } from '../../../services/teacher/payroll-management/payroll-management.service'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Download, User, GraduationCap, Wallet } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

const BackPayDetail: React.FC = () => {
  const { payrollId } = useParams<{ payrollId: string }>()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: ['payroll-backpay', payrollId],
    queryFn: () => getPayrollDetail(payrollId!),
    enabled: !!payrollId,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
  
  const payroll = response?.data?.payroll
  // Lấy dữ liệu từ cấu trúc mới của API
  const allBackPayDetails = response?.data?.backPayDetails || [] 
  const summary = response?.data?.backPaySummary
  const backPayAmount = Number(summary?.totalBackPayAmount || 0)

  // Client-side pagination
  const totalItems = allBackPayDetails?.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const backPayDetails = allBackPayDetails?.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }

  // --- CẤU HÌNH CỘT (COLUMNS) ---
  const columns: Column<any>[] = [
    {
      key: 'sessionDate',
      header: 'Ngày ghi nhận',
      width: '120px',
      render: (item) => (
        <div className="flex flex-col">
            <span className="font-medium text-gray-900">
            {new Date(item.sessionDate).toLocaleDateString('vi-VN')}
            </span>
            <span className="text-[11px] text-gray-500">Ngày hóa đơn</span>
        </div>
      )
    },
    {
      key: 'info', 
      header: 'Thông tin nguồn nợ',
      width: '250px',
      render: (item) => (
        <div className="flex flex-col gap-1.5">
            {/* Tên Lớp */}
            {item.class ? (
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.class.name}</span>
                    <span className="text-xs text-gray-400 font-normal">({item.class.code})</span>
                </div>
            ) : (
                <span className="text-sm text-gray-400 italic">Lớp đã bị xóa</span>
            )}
            
            {/* Tên Học sinh */}
            {item.student ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 ml-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {item.student.name}
                    <span className="text-xs text-gray-400">({item.student.code})</span>
                </div>
            ) : (
                <span className="text-sm text-gray-400 italic ml-1">Học sinh không xác định</span>
            )}
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
                 Kỳ nợ: {new Date(item.source.monthDebt).toLocaleDateString('vi-VN', {month: 'long', year: 'numeric'})}
               </Badge>
             </div>
          )}
        </div>
      )
    },
    {
      key: 'revenueBase',
      header: 'Doanh thu gốc',
      width: '140px',
      render: (item) => (
        <div className="flex flex-col items-end">
            <span className="text-sm text-gray-600">
            {Number(item.revenueBase).toLocaleString('vi-VN')} đ
            </span>
            <span className="text-[10px] text-gray-400">Tổng hóa đơn</span>
        </div>
      )
    },
    {
      key: 'payoutRate',
      header: 'Tỷ lệ',
      width: '80px',
      render: (item) => (
        <div className="flex justify-center">
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
        <div className="flex flex-col items-end">
            <span className="font-bold text-green-600">
            +{Number(item.payoutAmount).toLocaleString('vi-VN')} đ
            </span>
        </div>
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
          <p className="text-red-600">Không thể tải dữ liệu</p>
          <Button onClick={() => refetch()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết truy lĩnh (Nợ cũ)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kỳ lương hiện tại: <span className="font-medium">{new Date(payroll.periodStart).toLocaleDateString('vi-VN')}</span> - <span className="font-medium">{new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất Excel
        </Button>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate('/teacher/payroll-management')}
              className="cursor-pointer hover:text-foreground"
            >
              Quản lý lương
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={() => navigate(`/teacher/payroll-management/${payrollId}`)}
              className="cursor-pointer hover:text-foreground"
            >
              Chi tiết kỳ lương
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Chi tiết truy lĩnh</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Summary Card */}
      <Card className="mb-6 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-yellow-800 text-lg">
            <Wallet className="w-5 h-5" />
            Tổng quan truy lĩnh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Số khoản nợ thu được</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                    {summary?.count || allBackPayDetails?.length}
                </span>
                <span className="text-sm text-gray-500">khoản</span>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Tổng tiền nhận thêm</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                    +{backPayAmount.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm text-gray-500">VNĐ</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Ngày xử lý</p>
              <div className="flex items-center gap-2 h-[36px]">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                    {summary?.processedAt
                    ? new Date(summary.processedAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <Card className="shadow-md border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg text-gray-800">
            Danh sách các khoản thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={backPayDetails}
            columns={columns}
            loading={isLoading}
            error={error?.message}
            onRetry={refetch}
            emptyMessage="Không có dữ liệu truy lĩnh nào."
            hoverable
            striped
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              itemsPerPage,
              onPageChange: handlePageChange,
              onItemsPerPageChange: handleItemsPerPageChange,
              showItemsPerPage: true,
              showPageInfo: true
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default BackPayDetail