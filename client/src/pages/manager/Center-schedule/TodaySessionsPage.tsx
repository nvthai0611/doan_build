import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Search, Filter, Copy, MoreVertical, Clock, X } from 'lucide-react';
import { centerOwnerScheduleService } from '@/services/center-owner/center-schedule/schedule.service';
import { classService } from '@/services/center-owner/class-management/class.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, Column } from '@/components/common/Table/DataTable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CodeDisplay } from '../../../components/common/CodeDisplay';
import { SESSION_STATUS_LABELS, SESSION_STATUS_COLORS, SessionStatus } from '@/lib/constants';

interface TeacherInSession {
  id: string;
  stt: number;
  teacher: {
    id: string;
    userId: string;
    fullName: string;
    avatar: string | null;
    email: string;
    teacherCode: string;
  };
  role: string;
  session: {
    id: string;
    sessionNumber: string;
    status: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    dateTimeRange: string;
  };
  class: {
    id: string;
    name: string;
    classCode: string;
    subject: string;
  };
  enrollmentCount: number;
  checkin: string | null;
  checkout: string | null;
  attendanceStatus: string;
  recordedHours: number;
}

type AttendanceStatusFilter = 'all' | 'on_time' | 'late' | 'absent' | 'not_marked';

export default function TodaySessionsPage() {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start: today, end };
  });
  const [search, setSearch] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSessionStatus, setSelectedSessionStatus] = useState<string>('all');

  // Debounce search term để giảm số lần gọi API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(search.trim());
      // Reset về trang 1 khi search thay đổi
      if (search.trim() !== debouncedSearchTerm) {
        setPage(1);
      }
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [search, debouncedSearchTerm]);

  // Query để lấy data với filter
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['teachers-in-sessions-today', dateRange, debouncedSearchTerm, attendanceStatus, page, limit, selectedClassId, selectedSessionStatus],
    queryFn: () =>
      centerOwnerScheduleService.getTeachersInSessionsToday({
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd'),
        search: debouncedSearchTerm || undefined,
        attendanceStatus: attendanceStatus !== 'all' ? attendanceStatus : undefined,
        page,
        limit,
        classId: selectedClassId && selectedClassId !== 'all' ? selectedClassId : undefined,
        sessionStatus: selectedSessionStatus && selectedSessionStatus !== 'all' ? selectedSessionStatus : undefined,
      }),
    staleTime: 0,
  });

  // Query để lấy tất cả data (không filter) để tính count cho tabs
  const { data: allData } = useQuery({
    queryKey: ['teachers-in-sessions-today-all', dateRange, debouncedSearchTerm],
    queryFn: () =>
      centerOwnerScheduleService.getTeachersInSessionsToday({
        startDate: format(dateRange.start, 'yyyy-MM-dd'),
        endDate: format(dateRange.end, 'yyyy-MM-dd'),
        search: debouncedSearchTerm || undefined,
        attendanceStatus: undefined, // Lấy tất cả
        page: 1,
        limit: 100, // Lấy nhiều để đếm
      }),
    staleTime: 0,
  });

  // Query để lấy danh sách lớp học cho filter
  const { data: classesData } = useQuery({
    queryKey: ['classes-for-filter'],
    queryFn: () => classService.getClasses({ limit: 100 }),
    staleTime: 30000, // Cache 5 phút
    enabled: filterOpen, // Chỉ fetch khi filter mở
  });

  const classes = (classesData as any)?.data || [];

  // Tính số lượng theo từng trạng thái
  const getStatusCount = (status: AttendanceStatusFilter) => {
    if (!allData?.data) return 0;
    
    if (status === 'all') {
      return allData.meta?.total || 0;
    }
    
    const statusMap: { [key: string]: string } = {
      'on_time': 'Đúng giờ',
      'late': 'Đi muộn',
      'absent': 'Nghỉ',
      'not_marked': 'Chưa điểm danh',
    };
    
    const targetStatus = statusMap[status];
    return allData.data.filter((item: TeacherInSession) => item.attendanceStatus === targetStatus).length;
  };

  // Định nghĩa tabs
  interface Tab {
    key: AttendanceStatusFilter;
    label: string;
    count: number;
  }

  const tabs: Tab[] = [
    { key: 'all', label: 'Tất cả', count: getStatusCount('all') },
    { key: 'on_time', label: 'Đúng giờ', count: getStatusCount('on_time') },
    { key: 'late', label: 'Đi muộn', count: getStatusCount('late') },
    { key: 'absent', label: 'Nghỉ', count: getStatusCount('absent') },
    { key: 'not_marked', label: 'Chưa điểm danh', count: getStatusCount('not_marked') },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Đúng giờ':
        return 'default';
      case 'Đi muộn':
        return 'secondary';
      case 'Nghỉ':
        return 'destructive';
      case 'Chưa điểm danh':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getSessionStatusBadge = (status: string) => {
    // Sử dụng label và màu từ constants
    const label = SESSION_STATUS_LABELS[status as SessionStatus] || status;
    const className = SESSION_STATUS_COLORS[status as SessionStatus] || '';
    
    // Map variant dựa trên status (fallback nếu không có className)
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
    switch (status) {
      case SessionStatus.HAS_NOT_HAPPENED:
        variant = 'secondary';
        break;
      case SessionStatus.END:
      case SessionStatus.CANCELLED:
        variant = 'destructive';
        break;
      case SessionStatus.HAPPENING:
        variant = 'default';
        break;
      case SessionStatus.DAY_OFF:
        variant = 'secondary';
        break;
      default:
        variant = 'outline';
    }
    
    return { label, variant, className };
  };

  const copyTeacherCode = (teacherCode: string) => {
    navigator.clipboard.writeText(teacherCode);
    // Có thể thêm toast notification ở đây
  };

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = format(start, 'dd/MM/yyyy, HH:mm', { locale: vi });
    const endStr = format(end, 'dd/MM/yyyy, HH:mm', { locale: vi });
    return `${startStr} → ${endStr}`;
  };

  // Định nghĩa columns cho DataTable
  const columns: Column<TeacherInSession>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '60px',
      align: 'center',
      render: (item) => item.stt,
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      render: (item) => {
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.teacher.avatar || undefined} />
              <AvatarFallback>
                {item.teacher.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{item.teacher.fullName}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <CodeDisplay code={item.teacher.teacherCode} hiddenLength={4} />
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyTeacherCode(item.teacher.teacherCode);
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (item) => <Badge variant="outline">{item.role}</Badge>,
    },
    {
      key: 'session',
      header: 'Buổi',
      render: (item) => {
        const sessionStatus = getSessionStatusBadge(item.session.status);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {item.session.sessionNumber ? `Buổi ${item.session.sessionNumber}` : 'N/A'}
              </span>
              <Badge variant={sessionStatus.variant} className={sessionStatus.className}>
                {sessionStatus.label}
              </Badge>
            </div>
            <span className="text-sm text-gray-500">{item.session.dateTimeRange}</span>
          </div>
        );
      },
    },
    {
      key: 'class',
      header: 'Lớp',
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.class.name}</span>
          <span className="text-sm text-gray-500">{item.class.classCode}</span>
        </div>
      ),
    },
    {
      key: 'enrollmentCount',
      header: 'Sĩ số',
      align: 'center',
      render: (item) => item.enrollmentCount,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-semibold text-gray-900">Danh sách giáo viên tham gia buổi học</h1>
        <nav className="mt-2 text-sm text-gray-500">
          <span>Dashboard</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Danh sách giáo viên tham gia buổi học</span>
        </nav>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b space-y-4">
        <div className="flex items-center gap-4">
          {/* Date Range Picker */}
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[350px] justify-start text-left font-normal overflow-hidden"
              >
                <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">{formatDateRange(dateRange.start, dateRange.end)}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Từ</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={format(dateRange.start, 'dd/MM/yyyy HH:mm', { locale: vi })}
                      readOnly
                      className="flex-1"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.start}
                          onSelect={(date) => {
                            if (date) {
                              const newStart = new Date(date);
                              newStart.setHours(0, 0, 0, 0);
                              setDateRange({ ...dateRange, start: newStart });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Đến</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={format(dateRange.end, 'dd/MM/yyyy HH:mm', { locale: vi })}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newEnd = new Date();
                        newEnd.setHours(23, 59, 59, 999);
                        setDateRange({ ...dateRange, end: newEnd });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dateRange.end}
                          onSelect={(date) => {
                            if (date) {
                              const newEnd = new Date(date);
                              newEnd.setHours(23, 59, 59, 999);
                              setDateRange({ ...dateRange, end: newEnd });
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setDatePickerOpen(false);
                    setPage(1);
                  }}
                >
                  OK
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm theo tên giáo viên"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-10"
            />
            {/* Loading indicator khi đang debounce */}
            {search !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Bộ lọc
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Bộ lọc</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Trạng thái buổi học</label>
                    <Select
                      value={selectedSessionStatus}
                      onValueChange={setSelectedSessionStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Trạng thái buổi học">
                          {selectedSessionStatus === 'all' ? 'Trạng thái buổi học' : 
                           selectedSessionStatus === 'happening' ? 'Đang diễn ra' :
                           selectedSessionStatus === 'has_not_happened' ? 'Chưa diễn ra' :
                           selectedSessionStatus === 'end' ? 'Đã kết thúc' :
                           selectedSessionStatus === 'day_off' ? 'Nghỉ' : 'Trạng thái buổi học'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="happening">Đang diễn ra</SelectItem>
                        <SelectItem value="has_not_happened">Chưa diễn ra</SelectItem>
                        <SelectItem value="end">Đã kết thúc</SelectItem>
                        <SelectItem value="day_off">Nghỉ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Chọn lớp học</label>
                    <Select
                      value={selectedClassId}
                      onValueChange={setSelectedClassId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp học">
                          {selectedClassId === 'all' ? 'Chọn lớp học' :
                           classes.find((c: any) => c.id === selectedClassId)?.name || 'Chọn lớp học'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {classes.map((classItem: any) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.name} - {classItem.classCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 bg-white border-b">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setAttendanceStatus(tab.key);
                  setPage(1); // Reset về trang 1 khi đổi tab
                }}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  attendanceStatus === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}{' '}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6">
        <DataTable
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="Không có dữ liệu"
          pagination={
            data?.meta
              ? {
                  currentPage: page,
                  totalPages: data.meta.totalPages,
                  totalItems: data.meta.total,
                  itemsPerPage: limit,
                  onPageChange: setPage,
                  onItemsPerPageChange: setLimit,
                  showItemsPerPage: true,
                  showPageInfo: true,
                }
              : undefined
          }
          rowKey={(item) => item.id}
        />
      </div>
    </div>
  );
}

