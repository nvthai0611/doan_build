import { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  XCircle,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { parentStudentLeaveRequestService } from '../../../../services/parent/student-leave-request/student-leave.service';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../../../utils/format';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../../../../components/common/Table/DataTable';
import type { StudentLeaveRequest } from '../../../../services/parent/student-leave-request/student-leave.types';
import StudentLeaveRequestDetailModal from './StudentLeaveRequestDetailModal';
import { toast } from 'sonner';

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
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
}) => {
  const res = await parentStudentLeaveRequestService.getStudentLeaveRequests(params);
  return res;
};

export default function StudentLeaveRequestList() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<StudentLeaveRequest | null>(null);
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
    refetch,
  } = useQuery({
    queryKey: ['student-leave-requests', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchLeaveRequests({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const leaveRequests = leaveRequestsResponse?.data || [];
  const meta = leaveRequestsResponse?.meta;
  const counts = leaveRequestsResponse?.counts;

  const getSortedSessions = (item: StudentLeaveRequest) => {
    const sessions = Array.isArray((item as any)?.affectedSessions)
      ? ((item as any).affectedSessions as any[])
      : [];

    return [...sessions].sort((a, b) => {
      const dateA = a?.session?.sessionDate ? new Date(a.session.sessionDate).getTime() : Number.POSITIVE_INFINITY;
      const dateB = b?.session?.sessionDate ? new Date(b.session.sessionDate).getTime() : Number.POSITIVE_INFINITY;
      if (dateA !== dateB) return dateA - dateB;
      const timeA = a?.session?.startTime || '';
      const timeB = b?.session?.startTime || '';
      return timeA.localeCompare(timeB);
    });
  };

  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN');
  };

  const formatTimeRange = (session: any) => {
    const start = session?.session?.startTime;
    const end = session?.session?.endTime;
    if (!start && !end) return '';
    if (start && end) return `${start} - ${end}`;
    return start || end || '';
  };

  const getClassSummary = (item: StudentLeaveRequest) => {
    const sessions = getSortedSessions(item);
    const names = Array.from(
      new Set(
        sessions
          .map((s) => s?.session?.class?.name)
          .filter((name): name is string => Boolean(name))
      )
    );
    if (names.length === 0) return '—';
    const display = names.slice(0, 2).join(', ');
    const extra = names.length > 2 ? ` +${names.length - 2}` : '';
    return `${display}${extra}`;
  };

  // Table columns
  const columns: Column<StudentLeaveRequest>[] = [
    {
      key: 'student',
      header: 'Học sinh',
      render: (item) => (
        <div>
          <div className="font-medium">{item.student?.user.fullName || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">{item.student?.user.email || ''}</div>
        </div>
      ),
    },
    {
      key: 'classSummary',
      header: 'Lớp/Môn',
      render: (item) => {
        const summary = getClassSummary(item);
        return <span className="text-sm">{summary}</span>;
      },
    },
    {
      key: 'sessionCount',
      header: 'Số buổi',
      render: (item) => {
        const count = Array.isArray((item as any)?.affectedSessions) ? (item as any).affectedSessions.length : 0;
        return <span className="font-medium">{count}</span>;
      },
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
      key: 'createdAt',
      header: 'Ngày tạo',
      render: (item) => formatDate(item.createdAt),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Button title="Xem chi tiết" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleViewDetails(item)}>
            <Eye className="h-4 w-4" />
          </Button>
          {item.status === 'pending' && (
            <>
              <Button title="Chỉnh sửa" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(item)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                title="Hủy đơn"
                variant="ghost"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                onClick={() => handleCancel(item)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Event handlers
  const handleViewDetails = (leaveRequest: StudentLeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeaveRequest(null);
  };

  const handleEdit = (leaveRequest: StudentLeaveRequest) => {
    navigate(`/parent/student-leave-requests/edit/${leaveRequest.id}`);
  };

  const handleCancel = async (leaveRequest: StudentLeaveRequest) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn nghỉ học này?')) {
      return;
    }

    try {
      await parentStudentLeaveRequestService.cancelStudentLeaveRequest(leaveRequest.id);
      toast.success('Đã hủy đơn nghỉ học thành công');
      refetch();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi hủy đơn nghỉ học');
    }
  };

  const handleCreateNew = () => {
    navigate('/parent/student-leave-requests/create');
  };

  // Tab configuration
  const displayCounts = {
    pending: counts?.pending ?? (activeTab === 'pending' ? (meta?.total ?? 0) : 0),
    approved: counts?.approved ?? (activeTab === 'approved' ? (meta?.total ?? 0) : 0),
    rejected: counts?.rejected ?? (activeTab === 'rejected' ? (meta?.total ?? 0) : 0),
    cancelled: counts?.cancelled ?? (activeTab === 'cancelled' ? (meta?.total ?? 0) : 0),
    all: counts?.all ?? (meta?.total ?? 0),
  };
  const tabs = [
    { id: 'all', label: 'Tất cả', count: displayCounts.all },
    { id: 'pending', label: 'Chờ duyệt', count: displayCounts.pending },
    { id: 'approved', label: 'Đã duyệt', count: displayCounts.approved },
    { id: 'rejected', label: 'Từ chối', count: displayCounts.rejected },
    { id: 'cancelled', label: 'Đã hủy', count: displayCounts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Danh sách đơn nghỉ học</h1>
          <p className="text-muted-foreground">
            Quản lý đơn nghỉ học của con bạn
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm mới đơn nghỉ học
        </Button>
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
          emptyMessage={
            activeTab === 'all'
              ? 'Chưa có đơn nào'
              : activeTab === 'pending'
              ? 'Chưa có đơn chờ duyệt'
              : activeTab === 'approved'
              ? 'Chưa có đơn đã duyệt'
              : activeTab === 'rejected'
              ? 'Chưa có đơn bị từ chối'
              : 'Không có dữ liệu'
          }
        />
      </div>

      {/* Detail Modal */}
      <StudentLeaveRequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        leaveRequest={selectedLeaveRequest}
      />
    </div>
  );
}

