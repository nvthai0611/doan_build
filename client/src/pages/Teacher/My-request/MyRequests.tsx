'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreHorizontal,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  ArrowRight,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { teacherLeaveRequestService } from '../../../services/teacher/leave-request/leave.service';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../../../components/common/Table/DataTable';
import type { LeaveRequest } from '../../../services/teacher/leave-request/leave.types';
import LeaveRequestDetailModal from './LeaveRequestDetailModal';

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

// Request type colors
const requestTypeColors = {
  sick_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  personal_leave: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  emergency_leave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

// Request type labels
const requestTypeLabels = {
  sick_leave: 'Nghỉ ốm',
  personal_leave: 'Nghỉ phép',
  emergency_leave: 'Nghỉ khẩn cấp',
  other: 'Khác',
};

// Status labels
const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const fetchLeaveRequests = async (params: {
  page: number;
  limit: number;
  status?: string;
  requestType?: string;
}) => {
  const res = await teacherLeaveRequestService.getMyLeaveRequests(params);
  return res;
};

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const navigate = useNavigate();

  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update underline position
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      const { offsetWidth, offsetLeft } = activeTabElement;
      setUnderlineStyle({
        width: offsetWidth,
        left: offsetLeft,
      });
    }
  }, [activeTab]);

  // Reset page when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery]);

  // Query to fetch leave requests
  const {
    data: leaveRequestsResponse,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ['my-leave-requests', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchLeaveRequests({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Debug logs
  console.log('leaveRequestsResponse:', leaveRequestsResponse);
  
  const leaveRequests = leaveRequestsResponse?.data || [];
  const meta = leaveRequestsResponse?.meta;

  console.log('leaveRequests:', leaveRequests);
  console.log('meta:', meta);

  // Table columns
  const columns: Column<LeaveRequest>[] = [
    {
      key: 'requestType',
      header: 'Loại đơn',
      render: (item) => (
        <Badge
          variant="secondary"
          className={requestTypeColors[item.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
        >
          {requestTypeLabels[item.requestType as keyof typeof requestTypeLabels] || item.requestType}
        </Badge>
      ),
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (item) => (
        <div className="max-w-[200px] truncate" title={item.reason}>
          {item.reason}
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Ngày bắt đầu',
      render: (item) => formatDate(item.startDate),
    },
    {
      key: 'endDate',
      header: 'Ngày kết thúc',
      render: (item) => formatDate(item.endDate),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item) => (
        <Badge
          variant="secondary"
          className={statusColors[item.status as keyof typeof statusColors] || statusColors.pending}
        >
          {statusLabels[item.status as keyof typeof statusLabels] || item.status}
        </Badge>
      ),
    },
    {
      key: 'affectedSessions',
      header: 'Sessions bị ảnh hưởng',
      align: 'center',
      render: (item) => (
        <Badge variant="outline">
          {item.affectedSessions?.length || 0} sessions
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(item)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            {/* {item.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleCancel(item)}
                  className="text-red-600"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Hủy đơn
                </DropdownMenuItem>
              </>
            )} */}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Event handlers
  const handleViewDetails = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeaveRequest(null);
  };

  const handleEdit = (leaveRequest: LeaveRequest) => {
    // Navigate to edit page
    console.log('Edit:', leaveRequest);
  };

  const handleCancel = (leaveRequest: LeaveRequest) => {
    // Handle cancel request
    console.log('Cancel:', leaveRequest);
  };

  const handleCreateNew = () => {
    navigate('/teacher/leave-request/create');
  };

  // Tab configuration
  const tabs = [
    { id: 'all', label: 'Tất cả', count: meta?.total || 0 },
    { id: 'pending', label: 'Chờ duyệt', count: 0 },
    { id: 'approved', label: 'Đã duyệt', count: 0 },
    { id: 'rejected', label: 'Từ chối', count: 0 },
    { id: 'cancelled', label: 'Đã hủy', count: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý đơn của tôi</h1>
          <p className="text-muted-foreground">
            Xem và quản lý các đơn xin nghỉ, đổi ca của bạn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative">
        <div className="flex space-x-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-2">
                {tab.label}
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.count}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
        <div
          className="absolute bottom-0 h-0.5 bg-primary transition-all duration-200"
          style={{
            width: `${underlineStyle.width}px`,
            left: `${underlineStyle.left}px`,
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo lý do..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 / trang</SelectItem>
            <SelectItem value="10">10 / trang</SelectItem>
            <SelectItem value="20">20 / trang</SelectItem>
            <SelectItem value="50">50 / trang</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={leaveRequests}
          pagination={{
            currentPage,
            totalPages: meta?.totalPages || 0,
            totalItems: meta?.total || 0,
            itemsPerPage: pageSize,
            onPageChange: setCurrentPage,
            onItemsPerPageChange: setPageSize,
          }}
          loading={isLoading}
          error={isError ? 'Có lỗi xảy ra khi tải dữ liệu' : null}
          emptyMessage="Chưa có đơn nào được tạo"
        />
      </div>

      {/* Detail Modal */}
      <LeaveRequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        leaveRequest={selectedLeaveRequest}
      />
    </div>
  );
}
