import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Calendar, Plus, MoreHorizontal, Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw, Star, Info, Undo, Check } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Column, PaginationConfig } from '../../../../components/common/Table/DataTable';
import { usePagination } from '../../../../hooks/usePagination';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'sonner';
import { SessionStatus, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS } from '../../../../lib/constants';

interface LessonsInfoProps {
  classId: string;
  classData?: any;
}

export const LessonsInfo = ({ classId, classData }: LessonsInfoProps) => {
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  
  // Pagination hook
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0 
  });
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset search when filter changes
  useEffect(() => {
    setSearchTerm('');
  }, [filter]);

  // Reset to page 1 when changing items per page
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [pagination.itemsPerPage]);
  
  // Fetch sessions data from API
  const { 
    data: sessionsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['classSessions', classId, classData?.academicYear, debouncedSearchTerm, filter, startDate, endDate, pagination.currentPage, pagination.itemsPerPage],
    queryFn: () => classService.getClassSessions(classId, {
      search: debouncedSearchTerm || undefined,
      status: filter !== 'all' ? filter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      academicYear: classData?.academicYear, // Chỉ lấy sessions cùng academicYear
      page: pagination.currentPage,
      limit: pagination.itemsPerPage,
      sortBy: "sessionDate",
      sortOrder: "asc",
    }),
    enabled: !!classId && !!classData?.academicYear,
    staleTime: 3000,
    refetchOnWindowFocus: true
  });

  const sessions = (sessionsResponse as any)?.data || [];
  const totalCount = (sessionsResponse as any)?.meta?.total || 0;
  const totalPages = (sessionsResponse as any)?.meta?.totalPages || 1;

  // Update pagination total items when data changes
  useEffect(() => {
    pagination.setItemsPerPage(pagination.itemsPerPage);
  }, [totalCount]);

  // Calculate metrics
  const metrics = {
    attended: sessions.reduce((sum: number, s: any) => sum + (s.attendanceCount || 0), 0),
    onTime: sessions.reduce((sum: number, s: any) => sum + (s.status === 'in_progress' ? (s.attendanceCount || 0) : 0), 0),
    late: sessions.reduce((sum: number, s: any) => sum + (s.lateCount || 0), 0),
    excusedAbsence: sessions.reduce((sum: number, s: any) => sum + (s.excusedAbsenceCount || 0), 0),
    unexcusedAbsence: sessions.reduce((sum: number, s: any) => sum + (s.unexcusedAbsenceCount || 0), 0),
    notAttended: sessions.reduce((sum: number, s: any) => sum + (s.notAttendedCount || 0), 0)
  };

  // Status filters với counts
  const statusFilters = [
    { key: SessionStatus.ALL, label: SESSION_STATUS_LABELS[SessionStatus.ALL], count: totalCount },
    { key: SessionStatus.SCHEDULED, label: SESSION_STATUS_LABELS[SessionStatus.SCHEDULED], count: sessions.filter((s: any) => s.status === SessionStatus.SCHEDULED).length },
    { key: SessionStatus.COMPLETED, label: SESSION_STATUS_LABELS[SessionStatus.COMPLETED], count: sessions.filter((s: any) => s.status === SessionStatus.COMPLETED).length },
    { key: SessionStatus.CANCELLED, label: SESSION_STATUS_LABELS[SessionStatus.CANCELLED], count: sessions.filter((s: any) => s.status === SessionStatus.CANCELLED).length }
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string; icon: any }> = {
      [SessionStatus.COMPLETED]: { 
        variant: 'default', 
        label: SESSION_STATUS_LABELS[SessionStatus.COMPLETED], 
        className: SESSION_STATUS_COLORS[SessionStatus.COMPLETED],
        icon: CheckCircle
      },
      [SessionStatus.SCHEDULED]: { 
        variant: 'secondary', 
        label: SESSION_STATUS_LABELS[SessionStatus.SCHEDULED],
        className: SESSION_STATUS_COLORS[SessionStatus.SCHEDULED],
        icon: Clock
      },
      [SessionStatus.CANCELLED]: { 
        variant: 'destructive', 
        label: SESSION_STATUS_LABELS[SessionStatus.CANCELLED],
        className: SESSION_STATUS_COLORS[SessionStatus.CANCELLED],
        icon: XCircle
      }
    };
    const config = variants[status] || variants[SessionStatus.SCHEDULED];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getAttendanceRate = (attendanceCount: number, totalStudents: number) => {
    if (totalStudents === 0) return 0;
    return Math.round((attendanceCount / totalStudents) * 100);
  };


  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '80px',
      align: 'center',
      render: (_: any, index: number) => ((pagination.currentPage - 1) * pagination.itemsPerPage + index + 1),
      sortable: true,
      sortKey: 'stt',
    },
    {
      key: 'lesson',
      header: 'Buổi học',
      width: '300px',
      sortable: true,
      sortKey: 'topic',
      searchable: true,
      searchPlaceholder: 'Tìm kiếm buổi học...',
      render: (session: any, index: number) => (
        <div>
          <div className="font-medium text-blue-600 cursor-pointer hover:underline">
            {session.topic || session.name || `Buổi ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-500">
            {(() => {
              const d = session.scheduledDate || session.sessionDate;
              if (!d) return '-';
              const weekday = getWeekdayName(d);
              const dateText = format(new Date(d), 'dd/MM/yyyy');
              const timeText = session.startTime && session.endTime ? ` ${session.startTime} → ${session.endTime}` : '';
              return `${weekday}: ${dateText}${timeText}`;
            })()}
                      </div>
                    </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '150px',
      align: 'center',
      render: (session: any) => getStatusBadge(session.status)
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      width: '200px',
      render: (session: any) => (
        <div className="text-sm text-gray-600">
          {session.teacher?.name || session.teacherName || '-'}
        </div>
      )
    },
    {
      key: 'attendance',
      header: 'Sĩ số',
      width: '120px',
      align: 'center',
      render: (session: any) => (
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{session.totalStudents || session.studentCount || 0}</span>
        </div>
      )
    },
    {
      key: 'absent',
      header: 'Nghỉ học',
      width: '100px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.absentCount || 0}</span>
      )
    },
    {
      key: 'notAttended',
      header: 'Chưa điểm danh',
      width: '120px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.notAttendedCount || 0}</span>
      )
    },
    {
      key: 'rating',
      header: 'Đánh giá',
      width: '150px',
      align: 'center',
      render: (session: any) => (
        <div className="flex items-center gap-1">
          <div className="flex">
            {renderStars(session.rating || 0)}
                    </div>
          <span className="text-sm text-gray-500">({session.rating || 0})</span>
                    </div>
      )
    },
    {
      key: 'actions',
      header: '',
      width: '80px',
      align: 'center',
      render: (session: any) => (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                        <DropdownMenuItem>Điểm danh</DropdownMenuItem>
                        <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Hủy buổi học</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
      )
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper: tên thứ (vi-VN)
  const getWeekdayName = (dateInput?: string | Date) => {
    if (!dateInput) return '';
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const names = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return names[d.getDay()] || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metrics.attended}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Đã điểm danh
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metrics.onTime}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Đúng giờ
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {metrics.late}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Đi muộn
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.excusedAbsence}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Nghỉ học có phép
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {metrics.unexcusedAbsence}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Nghỉ học không phép
              </div>
            </div>
        </CardContent>
      </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {metrics.notAttended}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Chưa điểm danh
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Danh sách buổi học
            </h1>
            <Info className="h-4 w-4 text-gray-400" />
              </div>
          <Sheet open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
            <SheetTrigger asChild>
              <Button >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mới buổi học
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-2xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Tạo lịch học tự động</SheetTitle>
              </SheetHeader>
              <AddLessonForm
                classId={classId}
                expectedStartDate={classData?.expectedStartDate}
                actualStartDate={classData?.actualStartDate}
                actualEndDate={classData?.actualEndDate}
                onClose={() => setIsAddLessonOpen(false)}
                onGenerated={() => {
                  refetch();
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
        <div className="flex items-end justify-between gap-4">
          <div className="flex items-end gap-4 flex-1">
            {/* Date filters */}
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col flex-1 max-w-md">
              <label className="text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên buổi học"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                {/* Loading indicator khi đang debounce */}
                {searchTerm !== debouncedSearchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
        <div className="border-b">
          <div className="flex">
            {statusFilters.map((filterOption) => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filter === filterOption.key
                    ? "border-purple-600 text-purple-600 bg-purple-50"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                }`}
              >
                {filterOption.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{filterOption.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={sessions}
          columns={columns}
          loading={isLoading}
          error={error ? "Có lỗi xảy ra khi tải dữ liệu" : null}
          onRetry={refetch}
          emptyMessage="Không có dữ liệu buổi học"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.setCurrentPage,
            onItemsPerPageChange: pagination.setItemsPerPage,
            showItemsPerPage: true,
            showPageInfo: true
          }}
          rowKey="id"
          hoverable={true}
          striped={false}
          enableSearch={false}
          enableSort={true}
          enableCheckbox={true}
          selectedItems={selectedSessions}
          onSelectionChange={setSelectedSessions}
          getItemId={(item: any) => item.id}
        />
      </div>
    </div>
  );
};

// Add Lesson Form Component
const AddLessonForm = ({
  classId,
  expectedStartDate,
  actualStartDate,
  actualEndDate,
  onClose,
  onGenerated
}: {
  classId: string;
  expectedStartDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  onClose: () => void;
  onGenerated?: () => void;
}) => {
  const initialStart = actualStartDate ? new Date(actualStartDate) : (expectedStartDate ? new Date(expectedStartDate) : new Date());
  const initialEnd = (() => {
    if (actualEndDate) {
      const base = new Date(actualEndDate);
      base.setHours(23, 59, 59, 999);
      return base;
    }
    
    // Mặc định là 31/05 của năm sau ngày khai giảng
    const startYear = initialStart.getFullYear();
    const endYear = startYear + 1;
    
    const base = new Date(endYear, 4, 31); // Tháng 5 (index 4), ngày 31
    base.setHours(23, 59, 59, 999);
    return base;
  })();

  const [startDate, setStartDate] = useState<Date | null>(expectedStartDate ? new Date(expectedStartDate) : null);
  const [endDate, setEndDate] = useState<Date>(initialEnd);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Validation functions
  const validateStartDate = (): string | null => {
    if (!startDate) {
      return "Vui lòng chọn ngày bắt đầu";
    }
    
    const now = new Date();
    if (startDate <= now) {
      return "Ngày bắt đầu phải sau ngày hiện tại";
    }
    
    if (startDate >= endDate) {
      return "Ngày bắt đầu phải trước ngày kết thúc";
    }
    
    return null;
  };

  const checkExistingSessions = async (): Promise<{ hasExisting: boolean; overwrite: boolean }> => {
    try {
      const existing = await classService.getClassSessions(classId, {
        startDate: startDate!.toISOString(),
        endDate: endDate.toISOString(),
        page: 1,
        limit: 1,
      });
      
      const totalExisting = (existing as any)?.meta?.total || 0;
      
      if (totalExisting === 0) {
        return { hasExisting: false, overwrite: false };
      }

      // Chỉ cho phép ghi đè nếu lớp chưa bắt đầu học
      const classStart = actualStartDate || expectedStartDate;
      if (classStart && new Date() >= new Date(classStart)) {
        throw new Error('Lớp đã bắt đầu học, không thể cập nhật lịch cũ.');
      }

      const confirmOverwrite = window.confirm('Đã có lịch trong khoảng thời gian này. Bạn có muốn cập nhật (ghi đè) lịch cũ?');
      if (!confirmOverwrite) {
        throw new Error('Hủy bỏ tạo buổi học');
      }

      return { hasExisting: true, overwrite: true };
    } catch (error) {
      throw error;
    }
  };

  const createSessionPayload = (overwrite: boolean) => {
    const basePayload = {
      startDate: startDate!.toISOString(),
      endDate: endDate.toISOString(),
      overwrite,
    };

    return actualStartDate || actualEndDate
      ? { ...basePayload, generateForFullYear: false }
      : { ...basePayload, generateForFullYear: true };
  };

  const handleGenerateSessions = async () => {
    try {
      // Validate input
      const validationError = validateStartDate();
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Check existing sessions
      const { overwrite } = await checkExistingSessions();

      // Generate sessions
      setIsGenerating(true);
      const payload = createSessionPayload(overwrite);
      await classService.generateSessions(classId, payload);
      
      // Success
      toast.success('Tạo buổi học thành công!');
      onGenerated && onGenerated();
      onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || 'Có lỗi xảy ra khi tạo buổi học');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calendar handlers
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      setStartDate(date);
      // Auto-update end date if not manually set
      if (!(actualStartDate || actualEndDate)) {
        const startYear = date.getFullYear();
        const endYear = startYear + 1;
        const endOfMay = new Date(endYear, 4, 31); // Tháng 5 (index 4), ngày 31
        endOfMay.setHours(23, 59, 59, 999);
        setEndDate(endOfMay);
      }
      setIsCalendarOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      setEndDate(endOfDay);
      setIsEndCalendarOpen(false);
    }
  };

  // Calendar disabled logic
  const isStartDateDisabled = (date: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 3);
    maxDate.setMonth(11, 31); // Tháng 12, ngày 31
    maxDate.setHours(23, 59, 59, 999);
    
    return date < now || date > maxDate || (endDate && date >= endDate);
  };

  const isEndDateDisabled = (date: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 3);
    maxDate.setMonth(11, 31); // Tháng 12, ngày 31
    maxDate.setHours(23, 59, 59, 999);
    
    return date < now || date > maxDate || (startDate !== null && date <= startDate);
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Action Buttons - Top Right */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          onClick={handleGenerateSessions}
          disabled={isGenerating}
        >
          <Check className="w-4 h-4" />
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Hệ thống sẽ tạo các buổi học theo lịch học của lớp
        </p>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
         Ngày bắt đầu
        </label>
        <div className="flex items-center gap-2">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd/MM/yyyy') : 'Chọn ngày bắt đầu'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate || undefined}
                onSelect={handleStartDateSelect}
                className="rounded-md border shadow-sm"
                captionLayout="dropdown"
                disabled={isStartDateDisabled}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 3}
              />
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-xs text-gray-500">
          Ngày bắt đầu phải sau ngày hiện tại và trước ngày kết thúc
        </p>
      </div>

      {/* End Date - chỉ hiện khi lớp thiếu actualStartDate/actualEndDate */}
      {(
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Ngày kết thúc
          </label>
          <div className="flex items-center gap-2">
            <Popover open={isEndCalendarOpen} onOpenChange={setIsEndCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(endDate, 'dd/MM/yyyy, HH:mm')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateSelect}
                  className="rounded-md border shadow-sm"
                  captionLayout="dropdown"
                  disabled={isEndDateDisabled}
                  fromYear={new Date().getFullYear()}
                  toYear={new Date().getFullYear() + 3}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

 

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button size="sm" className="rounded-full w-12 h-12 bg-blue-500 hover:bg-blue-600">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
