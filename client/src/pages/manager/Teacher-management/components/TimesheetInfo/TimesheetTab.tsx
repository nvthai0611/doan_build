'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, DollarSign, Eye, Download, FileText } from 'lucide-react';
import { centerOwnerTeacherService } from '../../../../../services/center-owner/teacher-management/teacher.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { DataTable, Column } from '@/components/common/Table/DataTable';
import { useNavigate } from 'react-router-dom';

interface TimesheetTabProps {
  teacherId: string;
  activeTab: string;
  fromDate: string;
  toDate: string;
  search: string;
  setActiveTab: (tab: string) => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setSearch: (search: string) => void;
}

interface Payroll {
  id: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  backPayAmount: number | null;
  bonuses: number | null;
  deductions: number | null;
  teachingHours: number | null;
  hourlyRate: number | null;
  status: string;
  sessionCount: number;
  teacher: {
    id: string;
    code: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function TimesheetTab({
  teacherId,
  activeTab,
  fromDate,
  toDate,
  search,
  setActiveTab,
  setFromDate,
  setToDate,
  setSearch,
}: TimesheetTabProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [yearFilter, setYearFilter] = useState<string>('');
  const navigate = useNavigate();
  // Fetch payrolls data
  const {
    data: payrollsResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'teacher-payrolls',
      teacherId,
      page,
      limit,
      statusFilter,
      monthFilter,
      yearFilter,
      search,
    ],
    queryFn: async () => {
      const params: any = {
        teacherId,
        page,
        limit,
      };

      if (statusFilter && statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (monthFilter) {
        params.month = monthFilter;
      }

      if (yearFilter) {
        params.year = yearFilter;
      }

      if (search) {
        params.teacherName = search;
      }

      const response = await centerOwnerTeacherService.getAllPayrolls(params);
      return response;
    },
    enabled: !!teacherId,
  });

  const payrolls = payrollsResponse?.data || [];
  const meta = payrollsResponse?.meta;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Chờ duyệt</Badge>;
      case 'waiting_teacher_approval':
        return (
          <Badge className="bg-blue-100 text-blue-800">Chờ GV duyệt</Badge>
        );
      case 'rejected_by_teacher':
        return <Badge className="bg-red-100 text-red-800">GV từ chối</Badge>;
      case 'approved_by_teacher':
        return <Badge className="bg-green-100 text-green-800">GV đồng ý</Badge>;
      case 'paid':
        return (
          <Badge className="bg-purple-100 text-purple-800">Đã thanh toán</Badge>
        );
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
  };

  const totalAmount = payrolls.reduce(
    (sum: number, p: Payroll) => sum + Number(p.totalAmount || 0),
    0,
  );
  const approvedAmount = payrolls
    .filter((p: Payroll) => p.status === 'paid')
    .reduce((sum: number, p: Payroll) => sum + Number(p.totalAmount || 0), 0);

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export payrolls');
  };

  // Define columns for DataTable
  const columns: Column<Payroll>[] = [
    {
      key: 'period',
      header: 'Kỳ lương',
      width: '200px',
      render: (payroll) => (
        <div className="font-medium">
          {formatDate(payroll.periodStart)} - {formatDate(payroll.periodEnd)}
        </div>
      ),
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      width: '180px',
      render: (payroll) => (
        <div>
          <p className="font-medium">{payroll.teacher.name}</p>
          <p className="text-sm text-gray-500">{payroll.teacher.code}</p>
        </div>
      ),
    },
    {
      key: 'sessionCount',
      header: 'Số buổi dạy',
      width: '120px',
      align: 'center',
      render: (payroll) => `${payroll.sessionCount} buổi`,
    },
    {
      key: 'teachingHours',
      header: 'Tổng giờ',
      width: '100px',
      align: 'center',
      render: (payroll) => `${payroll.teachingHours || 0}h`,
    },
    {
      key: 'totalAmount',
      header: 'Tổng tiền',
      width: '150px',
      align: 'right',
      render: (payroll) => (
        <span className="font-semibold">
          {formatCurrency(Number(payroll.totalAmount))}
        </span>
      ),
    },
    {
      key: 'bonuses',
      header: 'Thưởng/Phạt',
      width: '150px',
      render: (payroll) => {
        const bonuses = Number(payroll.bonuses || 0);
        const deductions = Number(payroll.deductions || 0);
        const hasData = bonuses !== 0 || deductions !== 0;

        if (!hasData) {
          return <span className="text-gray-400">-</span>;
        }

        return (
          <div className="space-y-1">
            {bonuses > 0 && (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                +{formatCurrency(bonuses)}
              </Badge>
            )}
            {deductions > 0 && (
              <Badge variant="outline" className="bg-red-50 text-red-700 center">
                -{formatCurrency(deductions)}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '150px',
      render: (payroll) => getStatusBadge(payroll.status),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '120px',
      align: 'center',
      render: (payroll) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/center-qn/payroll-teacher/payroll/${payroll.id}`)}>
          <Eye className="w-4 h-4 mr-2" />
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bảng lương
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="waiting_teacher_approval">
                Chờ GV duyệt
              </SelectItem>
              <SelectItem value="rejected_by_teacher">GV từ chối</SelectItem>
              <SelectItem value="approved_by_teacher">GV đồng ý</SelectItem>
              <SelectItem value="paid">Đã thanh toán</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="month"
            placeholder="Chọn tháng"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              setStatusFilter('all');
              setMonthFilter('');
              setYearFilter('');
              setSearch('');
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Tổng tiền</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">
                  Đã thanh toán
                </p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(approvedAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll DataTable */}
      <DataTable
        data={payrolls}
        columns={columns}
        loading={isLoading}
        emptyMessage="Không có dữ liệu bảng lương"
        rowKey="id"
        pagination={{
          currentPage: page,
          totalPages: meta?.totalPages || 1,
          totalItems: meta?.total || 0,
          itemsPerPage: limit,
          onPageChange: setPage,
          onItemsPerPageChange: setLimit,
          showItemsPerPage: true,
          showPageInfo: true,
        }}
        enableSearch={false}
        enableSort={false}
        hoverable={true}
      />
    </div>
  );
}
