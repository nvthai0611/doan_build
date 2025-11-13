import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { teacherStudentLeaveRequestService } from '../../../services/teacher/student-leave-request/student-leave.service';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../../utils/format';
import { DataTable, type Column } from '../../../components/common/Table/DataTable';
import type { TeacherStudentLeaveRequest } from '../../../services/teacher/student-leave-request/student-leave.types';
import StudentLeaveRequestDetailModal from './StudentLeaveRequestDetailModal';
import { toast } from 'sonner';

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

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
  search?: string;
}) => {
  return teacherStudentLeaveRequestService.getStudentLeaveRequests(params);
};

export default function StudentLeaveRequestList() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<TeacherStudentLeaveRequest | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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
    queryKey: ['teacher-student-leave-requests', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchLeaveRequests({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
        search: debouncedSearchQuery || undefined,
      }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const leaveRequests = leaveRequestsResponse?.data || [];
  const meta = leaveRequestsResponse?.meta;

  // Table columns
  const columns: Column<TeacherStudentLeaveRequest>[] = [
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
      key: 'parent',
      header: 'Phụ huynh',
      render: (item) => (
        <div>
          {item.student?.parent ? (
            <>
              <div className="font-medium text-sm">{item.student.parent.user.fullName}</div>
              <div className="text-xs text-muted-foreground">{item.student.parent.user.phone || item.student.parent.user.email}</div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: 'classes',
      header: 'Lớp học',
      render: (item) => {
        const classes = item.classes || [];
        if (classes.length === 0) {
          return <div className="text-muted-foreground">N/A</div>;
        }
        if (classes.length === 1) {
          return (
            <div>
              <div className="font-medium">{classes[0].name}</div>
              <div className="text-xs text-muted-foreground">{classes[0].subject?.name || ''}</div>
            </div>
          );
        }
        return (
          <div>
            <div className="font-medium">{classes.length} lớp học</div>
            <div className="text-xs text-muted-foreground">
              {classes.map(c => c.name).join(', ')}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dateRange',
      header: 'Thời gian nghỉ',
      render: (item) => {
        const sessions = Array.isArray((item as any)?.affectedSessions) ? (item as any).affectedSessions : [];
        if (sessions.length > 0) {
          const sorted = [...sessions].sort((a: any, b: any) => {
            const da = a?.session?.sessionDate ? new Date(a.session.sessionDate).getTime() : Infinity;
            const db = b?.session?.sessionDate ? new Date(b.session.sessionDate).getTime() : Infinity;
            return da - db;
          });
          const first = sorted[0]?.session?.sessionDate;
          const last = sorted[sorted.length - 1]?.session?.sessionDate || first;
          return (
            <div className="text-sm">
              <div>{first ? new Date(first).toLocaleDateString('vi-VN') : '—'}</div>
              <div className="text-muted-foreground">→ {last ? new Date(last).toLocaleDateString('vi-VN') : '—'}</div>
            </div>
          );
        }
        return (
          <div className="text-sm">
            <div>{formatDate(item.startDate)}</div>
            <div className="text-muted-foreground">→ {formatDate(item.endDate)}</div>
          </div>
        );
      },
    },
    {
      key: 'sessions',
      header: 'Buổi học',
      render: (item) => (
        <div className="text-center">
          {item.affectedSessions?.length || 0} buổi
        </div>
      ),
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
              <Button title="Duyệt đơn" variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:text-green-700" onClick={() => handleApprove(item)}>
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button title="Từ chối" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleReject(item)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Event handlers
  const handleViewDetails = (leaveRequest: TeacherStudentLeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeaveRequest(null);
    refetch();
  };

  const handleApprove = async (leaveRequest: TeacherStudentLeaveRequest) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt đơn nghỉ học của ${leaveRequest.student?.user.fullName}?`)) {
      return;
    }

    try {
      await teacherStudentLeaveRequestService.approveStudentLeaveRequest(leaveRequest.id, {});
      toast.success('Đã duyệt đơn nghỉ học thành công');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt đơn';
      toast.error(errorMessage);
    }
  };

  const handleReject = async (leaveRequest: TeacherStudentLeaveRequest) => {
    const notes = prompt(`Nhập lý do từ chối đơn nghỉ học của ${leaveRequest.student?.user.fullName}:`);
    if (notes === null) return; // User cancelled

    try {
      await teacherStudentLeaveRequestService.rejectStudentLeaveRequest(leaveRequest.id, { notes });
      toast.success('Đã từ chối đơn nghỉ học');
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối đơn';
      toast.error(errorMessage);
    }
  };

  // Tabs (không hiển thị badge số)
  const tabs = [
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
    { value: 'rejected', label: 'Từ chối' },
    { value: 'all', label: 'Tất cả' },
  ];

  return (
    <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10 min-h-screen px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Đơn nghỉ học của học sinh</h1>
          <p className="text-muted-foreground text-base mt-2">
            Quản lý và duyệt đơn nghỉ học của học sinh trong các lớp bạn phụ trách
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-card rounded-lg shadow-sm border mb-6">
          <div className="relative border-b">
            <div className="flex items-center gap-2 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  ref={(el) => (tabRefs.current[tab.value] = el)}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.value
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300"
              style={{
                width: `${underlineStyle.width}px`,
                left: `${underlineStyle.left}px`,
              }}
            />
          </div>

          {/* Search */}
          <div className="p-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={leaveRequests}
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
            pagination={
              meta
                ? {
                    currentPage: meta.page,
                    itemsPerPage: meta.limit,
                    totalItems: meta.total,
                    totalPages: meta.totalPages,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: () => {}, // Not used in this component
                  }
                : undefined
            }
          />
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLeaveRequest && (
        <StudentLeaveRequestDetailModal
          leaveRequest={selectedLeaveRequest}
          open={isDetailModalOpen}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
}

