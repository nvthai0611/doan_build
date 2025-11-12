import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, MoreHorizontal, Users, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, RefreshCw, Star, Info, Undo, Check, Trash2, CalendarOff, Edit, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Column, PaginationConfig } from '../../../../components/common/Table/DataTable';
import { usePagination } from '../../../../hooks/usePagination';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { centerOwnerScheduleService } from '../../../../services/center-owner/center-schedule/schedule.service';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'sonner';
import { SessionStatus, SESSION_STATUS_LABELS, SESSION_STATUS_COLORS, ClassStatus, CLASS_STATUS_LABELS } from '../../../../lib/constants';

interface LessonsInfoProps {
  classId: string;
  classData?: any;
}

export const LessonsInfo = ({ classId, classData }: LessonsInfoProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<SessionStatus>(SessionStatus.HAPPENING);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<{
    notes: string;
    startTime: string;
    endTime: string;
    sessionDate?: string;
  } | null>(null);
  const [originalSession, setOriginalSession] = useState<{
    notes: string;
    startTime: string;
    endTime: string;
    sessionDate?: string;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelPopoverSessionId, setCancelPopoverSessionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSession, setCancelSession] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
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
    setSelectedSessions([]); // Reset selection khi đổi filter
  }, [filter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [filter, debouncedSearchTerm, startDate, endDate]);
  
  const { 
    data: sessionsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['classSessions', classId, classData?.academicYear],
    queryFn: () => classService.getClassSessions(classId, {
      academicYear: classData?.academicYear,
      page: 1,
      limit: 999, // Lấy hết tất cả sessions
      sortBy: "sessionDate",
      sortOrder: "asc",
    }),
    enabled: !!classId && !!classData?.academicYear,
    staleTime: 1000,
    refetchOnWindowFocus: true
  });

  const allSessions = (sessionsResponse as any)?.data || [];

  // Filter sessions ở FE
  const filteredSessions = allSessions.filter((session: any) => {
    // Filter by status
    if (filter !== SessionStatus.HAPPENING && session.status !== filter) {
      return false;
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const notes = (session.notes || '').toLowerCase();
      const teacherName = (session.teacher?.name || session.teacherName || '').toLowerCase();
      if (!notes.includes(searchLower) && !teacherName.includes(searchLower)) {
        return false;
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      const sessionDate = new Date(session.scheduledDate || session.sessionDate);
      if (startDate && sessionDate < new Date(startDate)) {
        return false;
      }
      if (endDate && sessionDate > new Date(endDate)) {
        return false;
      }
    }

    return true;
  });

  // Pagination ở FE
  const totalCount = filteredSessions.length;
  const totalPages = Math.ceil(totalCount / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const sessions = filteredSessions.slice(startIndex, endIndex);
  
  // Update pagination total items when data changes
  useEffect(() => {
    // Đảm bảo currentPage không vượt quá totalPages
    if (pagination.currentPage > totalPages && totalPages > 0) {
      pagination.setCurrentPage(totalPages);
    }
  }, [totalCount, totalPages]);

  // Calculate metrics từ filteredSessions
  const metrics = {
    attended: filteredSessions.reduce((sum: number, s: any) => sum + (s.attendanceCount || 0), 0),
    onTime: filteredSessions.reduce((sum: number, s: any) => sum + (s.status === 'happening' ? (s.attendanceCount || 0) : 0), 0),
    late: filteredSessions.reduce((sum: number, s: any) => sum + (s.lateCount || 0), 0),
    excusedAbsence: filteredSessions.reduce((sum: number, s: any) => sum + (s.excusedAbsenceCount || 0), 0),
    unexcusedAbsence: filteredSessions.reduce((sum: number, s: any) => sum + (s.unexcusedAbsenceCount || 0), 0),
    notAttended: filteredSessions.reduce((sum: number, s: any) => sum + (s.notAttendedCount || 0), 0)
  };

  // Status filters với counts từ allSessions
  const statusFilters = [
    { key: SessionStatus.HAPPENING, label: SESSION_STATUS_LABELS[SessionStatus.HAPPENING], count: allSessions.filter((s: any) => s.status === SessionStatus.HAPPENING).length }, 
    { key: SessionStatus.END, label: SESSION_STATUS_LABELS[SessionStatus.END], count: allSessions.filter((s: any) => s.status === SessionStatus.END).length },
    { key: SessionStatus.HAS_NOT_HAPPENED, label: SESSION_STATUS_LABELS[SessionStatus.HAS_NOT_HAPPENED], count: allSessions.filter((s: any) => s.status === SessionStatus.HAS_NOT_HAPPENED).length },
    { key: SessionStatus.DAY_OFF, label: SESSION_STATUS_LABELS[SessionStatus.DAY_OFF], count: allSessions.filter((s: any) => s.status === SessionStatus.DAY_OFF).length }
  ];

  // Handle delete selected sessions
  const handleDeleteSessions = async () => {
    if (selectedSessions.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 buổi học để xóa');
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa ${selectedSessions.length} buổi học đã chọn?`
    );

    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      await classService.deleteSessions(classId, selectedSessions);
      toast.success(`Đã xóa ${selectedSessions.length} buổi học thành công!`);
      setSelectedSessions([]);
      refetch();
    } catch (error: any) {
      console.error('Error deleting sessions:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi xóa buổi học');
    } finally {
      setIsDeleting(false);
    }
  };

  const openCancelPopover = (session: any) => {
    setCancelSession(session);
    setCancelReason(session?.cancellationReason || '');
    setCancelPopoverSessionId(session.id);
  };

  const closeCancelPopover = () => {
    setCancelPopoverSessionId(null);
    if (!isCancelling) {
      setCancelSession(null);
      setCancelReason('');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelSession) return;
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do nghỉ buổi học');
      return;
    }

    setIsCancelling(true);
    try {
      await centerOwnerScheduleService.updateSession(cancelSession.id, {
        status: SessionStatus.DAY_OFF,
        cancellationReason: cancelReason.trim(),
      } as any);

      toast.success('Đã ghi nhận buổi học nghỉ');
      closeCancelPopover();
      await refetch();
    } catch (error: any) {
      toast.error(error?.message || 'Không thể cập nhật trạng thái buổi học');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSuggestPostpone = (session: any) => {
    toast.info('Hướng dẫn lùi lịch', {
      description: 'Mở chi tiết buổi học và chỉnh sửa ngày/giờ, hoặc tạo yêu cầu đổi lịch trong mục Quản lý lịch.',
    });
  };

  const renderStatusBadge = (session: any) => {
    const status = session.status;
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string; icon: any }> = {
      [SessionStatus.END]: { 
        variant: 'default', 
        label: SESSION_STATUS_LABELS[SessionStatus.END], 
        className: SESSION_STATUS_COLORS[SessionStatus.END],
        icon: CheckCircle
      },
      [SessionStatus.HAPPENING]: { 
        variant: 'secondary', 
        label: SESSION_STATUS_LABELS[SessionStatus.HAPPENING],
        className: SESSION_STATUS_COLORS[SessionStatus.HAPPENING],
        icon: Clock
      },
      [SessionStatus.HAS_NOT_HAPPENED]: {   
        variant: 'destructive', 
        label: SESSION_STATUS_LABELS[SessionStatus.HAS_NOT_HAPPENED],
        className: SESSION_STATUS_COLORS[SessionStatus.HAS_NOT_HAPPENED],
        icon: XCircle
      },
      [SessionStatus.DAY_OFF]: {   
        variant: 'outline', 
        label: SESSION_STATUS_LABELS[SessionStatus.DAY_OFF],
        className: SESSION_STATUS_COLORS[SessionStatus.DAY_OFF],
        icon: CalendarOff
      },
      [SessionStatus.CANCELLED]: {
        variant: 'destructive', 
        label: SESSION_STATUS_LABELS[SessionStatus.CANCELLED],
        className: SESSION_STATUS_COLORS[SessionStatus.CANCELLED],
        icon: XCircle
      }
    };
    const config = variants[status] || variants[SessionStatus.HAPPENING];
    const Icon = config.icon;
    const badge = (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );

    if (status === SessionStatus.DAY_OFF) {
      const reason = session.cancellationReason || 'Chưa cung cấp lý do';
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{badge}</TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">
              Lý do nghỉ: {reason}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return badge;
  };

  const getAttendanceRate = (attendanceCount: number, totalStudents: number) => {
    if (totalStudents === 0) return 0;
    return Math.round((attendanceCount / totalStudents) * 100);
  };

  // Handle edit session
  // Handle edit session
  const handleStartEdit = (session: any) => {
    const sessionData = {
      notes: session.name || session.notes || session.topic || '',
      startTime: session.startTime || '08:00',
      endTime: session.endTime || '09:30',
      sessionDate: session.scheduledDate || session.sessionDate,
    };
    setEditingSessionId(session.id);
    setEditingSession(sessionData);
    setOriginalSession(sessionData); // Lưu giá trị gốc
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingSession(null);
    setOriginalSession(null);
  };

  // Helper: Tính duration giữa 2 thời gian (phút)
  const calculateDurationMinutes = (startTime: string, endTime: string): number => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    return endTotalMinutes - startTotalMinutes;
  };

  // Helper: Thêm phút vào thời gian
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  // Xử lý khi thay đổi startTime
  const handleStartTimeChange = (newStartTime: string) => {
    if (!editingSession || !originalSession) return;

    // Tính duration gốc
    const originalDuration = calculateDurationMinutes(
      originalSession.startTime,
      originalSession.endTime
    );

    // Tự động tính endTime mới = startTime mới + duration gốc
    const newEndTime = addMinutesToTime(newStartTime, originalDuration);

    setEditingSession({
      ...editingSession,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  };

  const handleSaveEdit = async (sessionId: string) => {
    if (!editingSession || !originalSession) return;

    try {
      setIsUpdating(true);

      // Format sessionDate to YYYY-MM-DD
      const sessionDateObj = editingSession.sessionDate 
        ? new Date(editingSession.sessionDate) 
        : new Date();
      const sessionDateStr = format(sessionDateObj, 'yyyy-MM-dd');

      // Kiểm tra xung đột lịch
      const conflictResult = await centerOwnerScheduleService.checkScheduleConflict(
        sessionId,
        sessionDateStr,
        editingSession.startTime,
        editingSession.endTime
      );

      let finalData = {
        notes: editingSession.notes,
        startTime: editingSession.startTime,
        endTime: editingSession.endTime,
      };

      if (conflictResult.hasConflict) {
        // Check xem có thay đổi gì không
        const startChanged = editingSession.startTime !== originalSession.startTime;
        const endChanged = editingSession.endTime !== originalSession.endTime;

        // Helper: Parse time to minutes
        const parseTimeToMinutes = (time: string): number => {
          const [hours, minutes] = time.split(':').map(Number);
          return hours * 60 + minutes;
        };

        // Helper: Convert minutes to time string
        const minutesToTime = (totalMinutes: number): string => {
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        };

        if (startChanged || endChanged) {
          // Tìm earliest conflict start time để cắt endTime
          const newStartMinutes = parseTimeToMinutes(editingSession.startTime);
          const newEndMinutes = parseTimeToMinutes(editingSession.endTime);
          
          // Tìm thời điểm sớm nhất mà conflict bắt đầu (sau newStartTime)
          let earliestConflictStart = newEndMinutes; // Mặc định là endTime hiện tại
          
          for (const conflict of conflictResult.conflicts) {
            const conflictStartMinutes = parseTimeToMinutes(conflict.startTime);
            const conflictEndMinutes = parseTimeToMinutes(conflict.endTime);
            
            // Nếu conflict bắt đầu sau newStart và trước earliestConflictStart
            if (conflictStartMinutes > newStartMinutes && conflictStartMinutes < earliestConflictStart) {
              earliestConflictStart = conflictStartMinutes;
            }
            
            // Nếu conflict đang diễn ra (bắt đầu trước newStart, kết thúc sau newStart)
            if (conflictStartMinutes <= newStartMinutes && conflictEndMinutes > newStartMinutes) {
              // Không thể update vì conflict ngay từ startTime
              toast.error(
                `Không thể cập nhật! Thời gian bắt đầu ${editingSession.startTime} đã bị trùng với lớp khác.\n` +
                `Trùng với: ${conflict.className} (${conflict.startTime} - ${conflict.endTime})`
              );
              setIsUpdating(false);
              return; // Không save
            }
          }
          
          // Điều chỉnh endTime để vừa khít với khoảng trống
          const adjustedEndTime = minutesToTime(earliestConflictStart);
          finalData.endTime = adjustedEndTime;
          
          // Hiển thị thông báo
          if (adjustedEndTime !== editingSession.endTime) {
            toast.warning(
              `Phát hiện trùng lịch! Đã tự động điều chỉnh giờ kết thúc: ${editingSession.endTime} → ${adjustedEndTime}\n` +
              `Trùng với: ${conflictResult.conflicts.map(c => `${c.className} (${c.startTime} - ${c.endTime})`).join(', ')}`
            );
          }
        }
      }

      // Thực hiện update
      await centerOwnerScheduleService.updateSession(sessionId, finalData);
      
      if (conflictResult.hasConflict) {
        const startChanged = editingSession.startTime !== originalSession.startTime;
        if (startChanged) {
          toast.success(`Đã cập nhật buổi học với giờ kết thúc điều chỉnh: ${finalData.endTime}`);
        } else {
          toast.success('Đã cập nhật buổi học thành công');
        }
      } else {
        toast.success('Cập nhật buổi học thành công');
      }

      setEditingSessionId(null);
      setEditingSession(null);
      setOriginalSession(null);
      refetch();
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật buổi học');
    } finally {
      setIsUpdating(false);
    }
  };


  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '10px',
      align: 'center',
      render: (_: any, index: number) => ((pagination.currentPage - 1) * pagination.itemsPerPage + index + 1),
      sortable: true,
      sortKey: 'stt',
    },
    {
      key: 'lesson',
      header: 'Buổi học',
      width: '80px',
      sortable: true,
      sortKey: 'topic',
      searchable: true,
      searchPlaceholder: 'Tìm kiếm buổi học...',
      render: (session: any, index: number) => {
        const isEditing = editingSessionId === session.id;
        const d = session.scheduledDate || session.sessionDate;
        const weekday = d ? getWeekdayName(d) : '';
        const dateText = d ? format(new Date(d), 'dd/MM/yyyy') : '-';
        
        return (
          <div className="group relative">
            {isEditing ? (
              // Edit mode
              <div className="space-y-2">
                <Input
                  value={editingSession?.notes || ''}
                  onChange={(e) => setEditingSession({ ...editingSession!, notes: e.target.value })}
                  placeholder="Tên buổi học"
                  className="text-sm"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={editingSession?.startTime || ''}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="text-sm h-8"
                  />
                  <span className="text-gray-500">→</span>
                  <Input
                    type="time"
                    value={editingSession?.endTime || ''}
                    onChange={(e) => setEditingSession({ ...editingSession!, endTime: e.target.value })}
                    className="text-sm h-8"
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {weekday}: {dateText}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={() => handleSaveEdit(session.id)}
                    disabled={isUpdating}
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2"
                    onClick={handleCancelEdit}
                    disabled={isUpdating}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="relative">
                <div 
                  className="font-medium text-blue-600 cursor-pointer hover:underline inline-block pr-8"
                  onClick={() => navigate(`/center-qn/classes/session-details/${session.id}`)}
                >
                  {`${session.name || session.notes || session.topic }`}
                </div>
                <div className="text-sm text-gray-500">
                  {weekday}: {dateText}
                  {session.startTime && session.endTime && ` ${session.startTime} → ${session.endTime}`}
                </div>
                {/* Edit icon - always visible */}
                <button
                  className="absolute top-0 right-0 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartEdit(session);
                  }}
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                </button>
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '80px',
      render: (session: any) => renderStatusBadge(session)
    },
    {
      key: 'teacher',
      header: 'Giáo viên',
      width: '200px',
      render: (session: any) => {
        const teacherName = session.teacher || session.teacherName;
        const isSubstitute = session.isSubstitute && session.substituteTeacher;
        const originalTeacher = session.originalTeacher;
        
        return (
          <div className="text-sm">
            {teacherName ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={isSubstitute ? 'text-orange-600 font-medium' : 'text-gray-600'}>
                    {teacherName}
                  </span>
                  {isSubstitute && (
                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-700 bg-orange-50">
                      Thay thế
                    </Badge>
                  )}
                </div>
                {isSubstitute && originalTeacher && originalTeacher !== teacherName && (
                  <div className="text-xs text-gray-500">
                    GV chính: {originalTeacher}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'attendance',
      header: 'Sĩ số',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <div className="flex items-center gap-1">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{session.studentCount || 0} / {session.totalStudents || session.studentCount || 0}</span>
        </div>
      )
    },
    {
      key: 'absent',
      header: 'Nghỉ học',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.absentCount || 0}</span>
      )
    },
    {
      key: 'present',
      header: 'Điểm danh',
      width: '80px',
      align: 'center',
      render: (session: any) => (
        <span className="text-sm">{session.attendanceCount || 0}</span>
      )
    },
    // {
    //   key: 'rating',
    //   header: 'Đánh giá',
    //   width: '150px',
    //   align: 'center',
    //   render: (session: any) => (
    //     <div className="flex items-center gap-1">
    //       <div className="flex">
    //         {renderStars(session.rating || 0)}
    //                 </div>
    //       <span className="text-sm text-gray-500">({session.rating || 0})</span>
    //                 </div>
    //   )
    // },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '200px',
      align: 'center',
      render: (session: any) => (
        <TooltipProvider delayDuration={300}>
          <div className="flex items-center justify-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/center-qn/classes/session-details/${session.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-orange-600 hover:text-orange-700"
                  onClick={() => handleSuggestPostpone(session)}
                >
                  <Clock className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lùi lịch</TooltipContent>
            </Tooltip>

            <Popover
              open={cancelPopoverSessionId === session.id}
              onOpenChange={(open) => {
                if (open) {
                  openCancelPopover(session);
                } else {
                  closeCancelPopover();
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                  disabled={session.status === SessionStatus.DAY_OFF || session.status === SessionStatus.CANCELLED || session.status === SessionStatus.END}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 space-y-3" align="end">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Lý do nghỉ <span className="text-red-500">*</span>
                  </p>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Ví dụ: Nghỉ lễ, giáo viên bận công tác..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeCancelPopover}
                    disabled={isCancelling}
                  >
                    Thoát
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? 'Đang lưu...' : 'Xác nhận'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </TooltipProvider>
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

        {/* <Card>
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
        </Card> */}
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
          <div className="flex gap-2">
            <Sheet open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
              <SheetTrigger asChild>
                {/* <Button 
                  disabled={classData?.status === ClassStatus.COMPLETED || classData?.status === ClassStatus.CANCELLED || allSessions.length > 0}
                  title={classData?.status === ClassStatus.COMPLETED || classData?.status === ClassStatus.CANCELLED || allSessions.length > 0 ? `Không thể tạo buổi học khi lớp có trạng thái ${CLASS_STATUS_LABELS[classData.status as ClassStatus]}` : ""}
                  >
                  <Plus className="h-4 w-4 mr-2" />
                  Tự động tạo buổi học
                </Button> */}
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
                    ? "border-blue-600 text-blue-600 "
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                }`}
              >
                {filterOption.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{filterOption.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Selection Bar - Thanh hiển thị khi có items được chọn */}
        {selectedSessions.length > 0 && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
            <div className="px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allIds = filteredSessions.map((session: any) => session.id);
                      setSelectedSessions(allIds);
                    } else {
                      setSelectedSessions([]);
                    }
                  }}
                />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Đã chọn {selectedSessions.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={handleDeleteSessions}
                disabled={isDeleting}
                title="Xóa buổi học đã chọn"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

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
          enableSort={false}
          enableCheckbox={true}
          selectedItems={selectedSessions}
          onSelectionChange={setSelectedSessions}
          getItemId={(item: any) => item.id}
          allData={filteredSessions}
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
    if (startDate < now) {
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
      // KHÔNG tự động thay đổi endDate khi startDate thay đổi
      // endDate luôn giữ giá trị mặc định (31/05) hoặc giá trị user đã chọn
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

      </div>

      {/* End Date */}
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
                  {format(endDate, 'dd/MM/yyyy')}
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
