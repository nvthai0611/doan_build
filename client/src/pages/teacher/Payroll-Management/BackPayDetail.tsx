import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPayrollDetail } from '../../../services/teacher/payroll-management/payroll-management.service'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Download } from 'lucide-react'
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
  const allBackPayDetails = payroll?.computedDetails?.backPayDetails || []
  const metadata = payroll?.computedDetails?.metadata
  const backPayAmount = Number(payroll?.backPayAmount || 0)

  // Client-side pagination
  const totalItems = allBackPayDetails.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const backPayDetails = allBackPayDetails.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit)
    setCurrentPage(1)
  }

  const columns: Column<any>[] = [
    {
      key: 'sessionDate',
      header: 'Ngày buổi học',
      width: '150px',
      render: (item) => (
        <span className="font-medium">
          {new Date(item.sessionDate).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Mô tả',
      width: '400px',
      render: (item) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{item.description}</p>
          {item.feeRecordId && (
            <p className="text-xs text-gray-500 mt-1">
              Mã hóa đơn: {item.feeRecordId.substring(0, 8)}...
            </p>
          )}
        </div>
      )
    },
    {
      key: 'revenuePerSession',
      header: 'Doanh thu/buổi',
      width: '150px',
      render: (item) => (
        <span className="text-sm text-gray-600">
          {Number(item.revenuePerSession).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'payoutRate',
      header: 'Tỷ lệ',
      width: '100px',
      render: (item) => (
        <Badge variant="outline">
          {(Number(item.payoutRate) * 100).toFixed(0)}%
        </Badge>
      )
    },
    {
      key: 'payoutAmount',
      header: 'Thanh toán',
      width: '150px',
      render: (item) => (
        <span className="font-bold text-yellow-600">
          +{Number(item.payoutAmount).toLocaleString('vi-VN')} đ
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
          <p className="text-red-600">Không thể tải dữ liệu</p>
          <Button onClick={() => refetch()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chi tiết lương (buổi dạy cũ)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kỳ lương: {new Date(payroll.periodStart).toLocaleDateString('vi-VN')} - {new Date(payroll.periodEnd).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Tải xuống
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
              Chi tiết lương
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Chi tiết lương (buổi dạy cũ)</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Summary Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Tổng quan lương (buổi dạy cũ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Tổng số khoản</p>
              <p className="text-3xl font-bold text-yellow-800">
                {metadata?.backPayCount || allBackPayDetails.length}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Tổng tiền lương (buổi dạy cũ)</p>
              <p className="text-3xl font-bold text-yellow-800">
                {backPayAmount.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 mb-1">Xử lý lúc</p>
              <p className="text-sm font-medium text-yellow-800">
                {metadata?.processedAt
                  ? new Date(metadata.processedAt).toLocaleString('vi-VN')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTable with Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>
            Danh sách chi tiết ({allBackPayDetails.length} khoản)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={backPayDetails}
            columns={columns}
            loading={isLoading}
            error={error?.message}
            onRetry={refetch}
            emptyMessage="Không có khoản lương (buổi dạy cũ) nào"
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