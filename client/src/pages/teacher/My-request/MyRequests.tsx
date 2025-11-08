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
  X,
  Loader2,
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
import { sessionRequestService } from '../../../services/teacher/session-request/session-request.service';
import { scheduleChangeService } from '../../../services/teacher/schedule-change/schedule-change.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';
import { DataTable, type Column } from '../../../components/common/Table/DataTable';
import type { LeaveRequest } from '../../../services/teacher/leave-request/leave.types';
import type { SessionRequestResponse } from '../../../services/teacher/session-request/session-request.types';
import type { ScheduleChangeResponse } from '../../../services/teacher/schedule-change/schedule-change.types';
import RequestDetailModal from './RequestDetailModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Union type for all request types
type RequestUnion = LeaveRequest | SessionRequestResponse | ScheduleChangeResponse;

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

// Request type colors
const requestTypeColors = {
  // Leave request types
  sick_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  personal_leave: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  emergency_leave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  // Session request types
  makeup_session: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  extra_session: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  // Schedule change types
  reschedule: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
};

// Request type labels
const requestTypeLabels = {
  // Leave request types
  sick_leave: 'Nghỉ ốm',
  personal_leave: 'Nghỉ phép',
  emergency_leave: 'Nghỉ khẩn cấp',
  other: 'Khác',
  // Session request types
  makeup_session: 'Bù buổi học',
  extra_session: 'Buổi học bổ sung',
  // Schedule change types
  reschedule: 'Dời lịch',
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

const fetchSessionRequests = async (params: {
  page: number;
  limit: number;
  status?: string;
  requestType?: string;
}) => {
  try {
    console.log('fetchSessionRequests called with params:', params);
    const res = await sessionRequestService.getMySessionRequests(params);
    console.log('fetchSessionRequests response:', res);
    return res;
  } catch (error) {
    console.error('fetchSessionRequests error:', error);
    throw error;
  }
};

const fetchScheduleChanges = async (params: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const res = await scheduleChangeService.getMyScheduleChanges(params);
  return res;
};

export default function MyRequests() {
  const [activeTab, setActiveTab] = useState('all');
  const [requestType, setRequestType] = useState('leave'); // leave, session, schedule
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<LeaveRequest | null>(null);
  const [selectedSessionRequest, setSelectedSessionRequest] = useState<SessionRequestResponse | null>(null);
  const [selectedScheduleChange, setSelectedScheduleChange] = useState<ScheduleChangeResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [leaveRequestToCancel, setLeaveRequestToCancel] = useState<LeaveRequest | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
  }, [activeTab, debouncedSearchQuery, requestType]);

  // Query to fetch leave requests
  const {
    data: leaveRequestsResponse,
    isLoading: leaveRequestsLoading,
    isError: leaveRequestsError,
    isFetching: leaveRequestsFetching,
  } = useQuery({
    queryKey: ['my-leave-requests', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchLeaveRequests({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    enabled: requestType === 'leave',
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  // Query to fetch session requests
  const {
    data: sessionRequestsResponse,
    isLoading: sessionRequestsLoading,
    isError: sessionRequestsError,
    isFetching: sessionRequestsFetching,
  } = useQuery({
    queryKey: ['my-session-requests', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchSessionRequests({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    enabled: requestType === 'session',
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  // Query to fetch schedule changes
  const {
    data: scheduleChangesResponse,
    isLoading: scheduleChangesLoading,
    isError: scheduleChangesError,
    isFetching: scheduleChangesFetching,
  } = useQuery({
    queryKey: ['my-schedule-changes', activeTab, currentPage, pageSize, debouncedSearchQuery],
    queryFn: () =>
      fetchScheduleChanges({
        page: currentPage,
        limit: pageSize,
        status: activeTab === 'all' ? undefined : activeTab,
      }),
    enabled: requestType === 'schedule',
    staleTime: 1000,
    refetchOnWindowFocus: false,
  });

  // Get current data based on request type
  const getCurrentData = () => {
    switch (requestType) {
      case 'leave':
        return {
          data: leaveRequestsResponse?.data || [],
          meta: leaveRequestsResponse?.meta,
          isLoading: leaveRequestsLoading,
          isError: leaveRequestsError,
          isFetching: leaveRequestsFetching,
        };
      case 'session':
        return {
          data: sessionRequestsResponse?.data || [],
          meta: sessionRequestsResponse?.meta,
          isLoading: sessionRequestsLoading,
          isError: sessionRequestsError,
          isFetching: sessionRequestsFetching,
        };
      case 'schedule':
        return {
          data: scheduleChangesResponse?.data || [],
          meta: scheduleChangesResponse?.meta,
          isLoading: scheduleChangesLoading,
          isError: scheduleChangesError,
          isFetching: scheduleChangesFetching,
        };
      default:
        return {
          data: [],
          meta: null,
          isLoading: false,
          isError: false,
          isFetching: false,
        };
    }
  };

  const currentData = getCurrentData();
  const requests = currentData.data;
  const meta = currentData.meta;
  const isLoading = currentData.isLoading;
  const isError = currentData.isError;
  const isFetching = currentData.isFetching;

  // Get columns based on request type
  const getColumns = (): Column<RequestUnion>[] => {
    console.log('requests:', currentData);

    switch (requestType) {
      case 'leave':
        return [
          {
            key: 'requestType',
            header: 'Loại đơn',
            render: (item: LeaveRequest) => (
              <Badge
                variant="secondary"
                className={
                  requestTypeColors[
                    item.requestType as keyof typeof requestTypeColors
                  ] || requestTypeColors.other
                }
              >
                {requestTypeLabels[
                  item.requestType as keyof typeof requestTypeLabels
                ] || item.requestType}
              </Badge>
            ),
          },
          {
            key: 'reason',
            header: 'Lý do',
            render: (item: LeaveRequest) => (
              <div className="max-w-[200px] truncate" title={item.reason}>
                {item.reason}
              </div>
            ),
          },
          {
            key: 'startDate',
            header: 'Ngày bắt đầu',
            render: (item: LeaveRequest) => formatDate(item.startDate),
          },
          {
            key: 'endDate',
            header: 'Ngày kết thúc',
            render: (item: LeaveRequest) => formatDate(item.endDate),
          },
          {
            key: 'status',
            header: 'Trạng thái',
            render: (item: LeaveRequest) => (
              <Badge
                variant="secondary"
                className={
                  statusColors[item.status as keyof typeof statusColors] ||
                  statusColors.pending
                }
              >
                {statusLabels[item.status as keyof typeof statusLabels] ||
                  item.status}
              </Badge>
            ),
          },
          {
            key: 'affectedSessions',
            header: 'Tiết học bị ảnh hưởng',
            align: 'center' as const,
            render: (item: LeaveRequest) => (
              <Badge variant="outline">
                {item.affectedSessions?.length || 0} tiết học
              </Badge>
            ),
          },
          {
            key: 'createdAt',
            header: 'Ngày tạo',
            render: (item: LeaveRequest) => formatDate(item.createdAt),
          },
          {
            key: 'actions',
            header: 'Thao tác',
            align: 'center' as const,
            render: (item: LeaveRequest) => (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 cursor-pointer bg-blue-500 text-white px-2 py-1 rounded-md" onClick={() => handleViewDetails(item)}>
                  <Eye className="h-4 w-4" />
                  Xem
                </div>
                {item.status === 'pending' && (
                  <div className="flex items-center gap-2 cursor-pointer bg-red-500 text-white px-2 py-1 rounded-md" onClick={() => handleCancel(item)}>
                    <X className="h-4 w-4" />
                    Hủy
                  </div>
                )}
              </div>
            ),
          },
        ] as Column<RequestUnion>[];
      
      case 'session':
        return [
          {
            key: 'requestType',
            header: 'Loại yêu cầu',
            render: (item: SessionRequestResponse) => (
              <Badge
                variant="secondary"
                className={requestTypeColors[item.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
              >
                {requestTypeLabels[item.requestType as keyof typeof requestTypeLabels] || item.requestType}
              </Badge>
            ),
          },
          {
            key: 'class',
            header: 'Lớp học',
            render: (item: SessionRequestResponse) => (
              <div>
                <div className="font-medium">{item.class.name}</div>
                <div className="text-sm text-muted-foreground">{item.class.subject.name}</div>
              </div>
            ),
          },
          {
            key: 'sessionDate',
            header: 'Ngày học',
            render: (item: SessionRequestResponse) => formatDate(item.sessionDate),
          },
          {
            key: 'time',
            header: 'Thời gian',
            render: (item: SessionRequestResponse) => `${item.startTime} - ${item.endTime}`,
          },
          {
            key: 'reason',
            header: 'Lý do',
            render: (item: SessionRequestResponse) => (
              <div className="max-w-[200px] truncate" title={item.reason}>
                {item.reason}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Trạng thái',
            render: (item: SessionRequestResponse) => (
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
            render: (item: SessionRequestResponse) => formatDate(item.createdAt.toString()),
          },
          {
            key: 'actions',
            header: 'Thao tác',
            align: 'center' as const,
            render: (item: SessionRequestResponse) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewSessionDetails(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ] as Column<RequestUnion>[];
      
      case 'schedule':
        return [
          {
            key: 'class',
            header: 'Lớp học',
            render: (item: ScheduleChangeResponse) => (
              <div>
                <div className="font-medium">{item.class.name}</div>
                <div className="text-sm text-muted-foreground">{item.class.subject.name}</div>
              </div>
            ),
          },
          {
            key: 'originalDate',
            header: 'Ngày cũ',
            render: (item: ScheduleChangeResponse) => formatDate(item.originalDate),
          },
          {
            key: 'newDate',
            header: 'Ngày mới',
            render: (item: ScheduleChangeResponse) => formatDate(item.newDate),
          },
          {
            key: 'time',
            header: 'Thời gian',
            render: (item: ScheduleChangeResponse) => (
              <div>
                <div className="text-sm">{item.originalTime}</div>
                <div className="text-sm text-muted-foreground">→ {item.newTime}</div>
              </div>
            ),
          },
          {
            key: 'reason',
            header: 'Lý do',
            render: (item: ScheduleChangeResponse) => (
              <div className="max-w-[200px] truncate" title={item.reason}>
                {item.reason}
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Trạng thái',
            render: (item: ScheduleChangeResponse) => (
              <Badge
                variant="secondary"
                className={statusColors[item.status as keyof typeof statusColors] || statusColors.pending}
              >
                {statusLabels[item.status as keyof typeof statusLabels] || item.status}
              </Badge>
            ),
          },
          {
            key: 'requestedAt',
            header: 'Ngày tạo',
            render: (item: ScheduleChangeResponse) => formatDate(item.requestedAt.toString()),
          },
          {
            key: 'actions',
            header: 'Thao tác',
            align: 'center' as const,
            render: (item: ScheduleChangeResponse) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewScheduleDetails(item)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ] as Column<RequestUnion>[];
      
      default:
        return [];
    }
  };

  const columns = getColumns();
  
  // Event handlers
  const handleViewDetails = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setIsDetailModalOpen(true);
  };

  const handleViewSessionDetails = (sessionRequest: SessionRequestResponse) => {
    setSelectedSessionRequest(sessionRequest);
    setIsDetailModalOpen(true);
  };

  const handleViewScheduleDetails = (scheduleChange: ScheduleChangeResponse) => {
    setSelectedScheduleChange(scheduleChange);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedLeaveRequest(null);
    setSelectedSessionRequest(null);
    setSelectedScheduleChange(null);
  };

  const handleEdit = (leaveRequest: LeaveRequest) => {
    // Navigate to edit page
    console.log('Edit:', leaveRequest);
  };

  // Mutation để cancel leave request
  const cancelLeaveRequestMutation = useMutation({
    mutationFn: (id: string) => teacherLeaveRequestService.cancelLeaveRequest(id),
    onSuccess: () => {
      toast.success('Hủy đơn xin nghỉ thành công');
      queryClient.invalidateQueries({ queryKey: ['my-leave-requests'] });
      setCancelConfirmOpen(false);
      setLeaveRequestToCancel(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Có lỗi xảy ra khi hủy đơn xin nghỉ'
      );
    },
  });

  const handleCancel = (leaveRequest: LeaveRequest) => {
    setLeaveRequestToCancel(leaveRequest);
    setCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (leaveRequestToCancel) {
      cancelLeaveRequestMutation.mutate(leaveRequestToCancel.id);
    }
  };

  const handleCreateNew = () => {
    switch (requestType) {
      case 'leave':
        navigate('/teacher/leave-request/create');
        break;
      case 'session':
        // Navigate to session request creation
        console.log('Create session request');
        break;
      case 'schedule':
        // Navigate to schedule change creation
        console.log('Create schedule change');
        break;
    }
  };

  // Request type tabs
  const requestTypeTabs = [
    { id: 'leave', label: 'Đơn xin nghỉ' },
    { id: 'session', label: 'Yêu cầu tạo buổi' },
    { id: 'schedule', label: 'Đơn dời lịch' },
  ];

  // Status tabs
  const statusTabs = [
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
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý đơn của tôi
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý các đơn xin nghỉ, yêu cầu tạo buổi học, đổi ca của
            bạn
          </p>
        </div>
      </div>

      {/* Request Type Tabs */}
      <div className="space-y-4">
        <div className="flex space-x-4">
          {requestTypeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRequestType(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                requestType === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="relative">
          <div className="flex space-x-8 border-b">
            {statusTabs.map((tab) => (
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
      </div>

      {/* Data Table */}
      <div className="rounded-md border">
        <DataTable<RequestUnion>
          columns={columns}
          data={requests}
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
          emptyMessage={`Chưa có ${
            requestType === 'leave'
              ? 'đơn xin nghỉ'
              : requestType === 'session'
              ? 'yêu cầu tạo buổi học'
              : 'đơn dời lịch'
          } nào được tạo`}
        />
      </div>

      {/* Detail Modal */}
      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        leaveRequest={selectedLeaveRequest}
        sessionRequest={selectedSessionRequest}
        scheduleChange={selectedScheduleChange}
        requestType={requestType}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận hủy đơn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn hủy đơn xin nghỉ này không? Hành động này
              không thể hoàn tác.
              {leaveRequestToCancel && (
                <div className="mt-2 p-2 bg-muted rounded-md">
                  <div className="text-sm font-medium">Thông tin đơn:</div>
                  <div className="text-sm text-muted-foreground">
                    Loại:{' '}
                    {requestTypeLabels[
                      leaveRequestToCancel.requestType as keyof typeof requestTypeLabels
                    ] || leaveRequestToCancel.requestType}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Từ: {formatDate(leaveRequestToCancel.startDate)} đến{' '}
                    {formatDate(leaveRequestToCancel.endDate)}
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelLeaveRequestMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelLeaveRequestMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelLeaveRequestMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </div>
              ) : (
                'Xác nhận hủy'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
