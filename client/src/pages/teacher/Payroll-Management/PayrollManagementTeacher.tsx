import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DataTable, type Column } from '../../../components/common/Table/DataTable'
import PayrollFilters from './components/PayrollFilters'
import PayrollSummaryCards from './components/PayrollSummaryCards'
import PayrollStatusBadge from './components/PayrollStatusBadge'
import { Button } from '@/components/ui/button'
import { Eye, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllPayrolls } from '../../../services/teacher/payroll-management/payroll-management.service'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/assets/shadcn-ui/components/ui/breadcrumb'

const PayrollManagementTeacher: React.FC = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState<any>({
    month: '',
    status: '',
    page: 1,
    limit: 10
  })

  // ✅ Fetch payrolls với React Query
  const { 
    data: payrollResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['teacher-payrolls', filters],
    queryFn: () => getAllPayrolls(filters),
    enabled: true,
    staleTime: 30000,
    refetchOnWindowFocus: false
  })
  
  
  // ✅ Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters((prev: any) => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset page khi filter thay đổi
    }))
  }

  // ✅ Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev: any) => ({ ...prev, page }))
  }

  const handleItemsPerPageChange = (limit: number) => {
    setFilters((prev: any) => ({ ...prev, limit, page: 1 }))
  }

  // ✅ Navigate to detail
  const handleViewDetail = (payroll: any) => {
    navigate(`/teacher/payroll-management/${payroll.id}`)
  }

  // ✅ Download PDF
  const handleDownloadPDF = async (payroll: any) => {
    // TODO: Implement download PDF
    console.log('Download PDF:', payroll.id)
  }

  // ✅ DataTable columns
  const columns: Column<any>[] = [
    {
      key: 'periodStart',
      header: 'Kỳ lương',
      width: '200px',
      render: (payroll) => {
  // Tạo bộ format cố định theo giờ VN
  const formatVietnamDate = (dateString : string) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            
            // Lấy giờ UTC (17:00 ngày 30) + 7 tiếng = Giờ VN (00:00 ngày 1)
            // Chúng ta dùng phương pháp UTC methods để không phụ thuộc vào giờ máy tính
            
            // Logic: Chuyển đổi timestamp sang giờ VN
            // Offset VN là +7 giờ = 7 * 60 * 60 * 1000 ms
            const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
            
            // Sau khi cộng 7 tiếng, ta lấy ngày/tháng/năm theo chuẩn UTC của thời gian mới
            const day = vnTime.getUTCDate().toString().padStart(2, '0');
            const month = (vnTime.getUTCMonth() + 1).toString().padStart(2, '0');
            const year = vnTime.getUTCFullYear();
            
            return `${day}/${month}/${year}`;
        };

  return (
    <div className="flex flex-col">
      <span className="font-medium">
        {formatVietnamDate(payroll.periodStart)} 
      </span>
      <span className="text-xs text-gray-500">
        đến {formatVietnamDate(payroll.periodEnd)}
      </span>
    </div>
  );
}
    },
    {
      key: 'totalAmount',
      header: 'Tổng lương',
      width: '150px',
      align: 'left',
      render: (payroll) => (
        <span className="font-semibold text-green-600">
          {Number(payroll.totalAmount).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'bonuses',
      header: 'Thưởng',
      width: '120px',
      align: 'left',
      render: (payroll) => (
        <span className="text-blue-600">
          +{Number(payroll.bonuses).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'deductions',
      header: 'Khấu trừ',
      width: '120px',
      align: 'left',
      render: (payroll) => (
        <span className="text-red-600">
          -{Number(payroll.deductions).toLocaleString('vi-VN')} đ
        </span>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '180px',
      align: 'left',
      render: (payroll) => <PayrollStatusBadge status={payroll.status} />
    },
    {
      key: 'adminPublishedAt',
      header: 'Ngày gửi',
      width: '150px',
      align: 'left',
      render: (payroll) => (
        <span className="text-sm text-gray-600">
          {payroll.adminPublishedAt 
            ? new Date(payroll.adminPublishedAt).toLocaleDateString('vi-VN')
            : '-'
          }
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '150px',
      align: 'left',
      render: (payroll) => (
        <div className="flex items-center  gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetail(payroll)}
            className="gap-1"
          >
            <Eye className="w-4 h-4" />
            Xem
          </Button>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownloadPDF(payroll)}
            className="gap-1"
          >
            <Download className="w-4 h-4" />
          </Button> */}
        </div>
      )
    }
  ]

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Quản lý bảng lương
        </h1>
        <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="text-foreground font-medium">
              Quản lý lương của tôi
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </div>

      {/* Summary Cards */}
      <PayrollSummaryCards 
        payrolls={payrollResponse?.data || []}
        loading={isLoading}
      />

      {/* Filters */}
      <PayrollFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Data Table */}
      <DataTable
        data={payrollResponse?.data || []}
        columns={columns}
        loading={isLoading}
        error={error?.message}
        onRetry={refetch}
        emptyMessage="Không có dữ liệu lương"
        hoverable
        striped
        pagination={{
          currentPage: payrollResponse?.pagination.currentPage || 1,
          totalPages: payrollResponse?.pagination.totalPages || 1,
          totalItems: payrollResponse?.pagination.totalItems || 0,
          itemsPerPage: payrollResponse?.pagination.itemsPerPage || 10,
          onPageChange: handlePageChange,
          onItemsPerPageChange: handleItemsPerPageChange,
          showItemsPerPage: true,
          showPageInfo: true
        }}
        enableSearch={false}
        enableSort={false}
      />
    </div>
  )
}

export default PayrollManagementTeacher
