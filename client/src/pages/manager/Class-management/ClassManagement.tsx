import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, UserPlus, Search, Filter, MoreHorizontal, Download, Upload, RefreshCw, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/clientAxios';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
// Services
import { classService } from '../../../services/center-owner/class-management/class.service';
// Components
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { Badge } from '@/components/ui/badge';
import { CodeDisplay } from '../../../components/common/CodeDisplay';

import { EditScheduleSheet } from './components/Sheet/EditScheduleSheet';
import { CloneClassDialog } from './components/Dialog/CloneClassDialog';
// import { EnrollStudentDialog } from './components/EnrollStudentDialog';

// Hooks
import { useClassesQuery } from './hooks/useClassesQuery';
import { useClassMutations } from './hooks/useClassMutations';
import { formatDate, formatSchedule } from '../../../utils/format';
import { useEnrollmentMutations } from './hooks/useEnrollmentMutations';

// Types
import { ClassType } from '../../../services/center-owner/class-management/class.types';
import { EnrollmentType } from '../../../services/center-owner/enrollment/enrollment.types';
import { usePagination } from '../../../hooks/usePagination';
import { getStatusBadge } from './const/statusBadge';
import { ClassStatus, CLASS_STATUS_LABELS } from '../../../lib/constants';



export const ClassManagement = () => {
    const navigate = useNavigate();
    // States
    const pagination = usePagination({
        initialPage: 1,
        initialItemsPerPage: 10,
        totalItems: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedDay, setSelectedDay] = useState('all'); // Thứ
    const [selectedShift, setSelectedShift] = useState('all'); // Ca học
    const [filterOpen, setFilterOpen] = useState(false);
    const [collectData, setCollectData] = useState(false);
    // Filter popover states
    const [filterTeacher, setFilterTeacher] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [filterRoom, setFilterRoom] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditScheduleSheetOpen, setIsEditScheduleSheetOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
    const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false);
    const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
            if (searchTerm !== debouncedSearchTerm) {
                pagination.setCurrentPage(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);



    // Build complete filters object - filter ở BE
    const completeFilters = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm.trim() || undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        dayOfWeek: selectedDay !== 'all' ? selectedDay : undefined,
        shift: selectedShift !== 'all' ? selectedShift : undefined,
        gradeId: selectedGrades && selectedGrades.length > 0 ? selectedGrades.join(',') : undefined,
        teacherId: filterTeacher || undefined,
        subjectId: filterCourse || undefined,
        roomId: filterRoom || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
    };

    // Queries - optimized with caching
    const { data: classesData, isLoading: isLoadingClasses, isError, refetch } = useClassesQuery(completeFilters);
    

    // Only fetch these when needed (for filters)
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const response = await apiClient.get('/subjects');
            return response;
        },
        staleTime:0, // Cache for 5 minutes
        enabled: filterOpen // Only fetch when filter is open
    });
    
    const { data: roomsData } = useQuery({
        queryKey: ['rooms'],
        queryFn: async () => {
            const response = await apiClient.get('/rooms');
            return response;
        },
        staleTime: 0, // Cache for 5 minutes
        enabled: filterOpen // Only fetch when filter is open
    });

    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: async () => {
            const response = await apiClient.get('/admin-center/teachers', {
                limit: 100 
            });
            return response;
        },
        staleTime: 0, 
        enabled: filterOpen 
    });

    
    // Mutations
    const { createClass, updateClass, deleteClass, assignTeacher } = useClassMutations();
    const { bulkEnroll } = useEnrollmentMutations();
    
    // Data 
    const classesRaw = (classesData as any)?.data || [];
    const meta = (classesData as any)?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };
    const subjects = (subjectsData as any)?.data || [];
    const rooms = (roomsData as any)?.data || [];
    const teachers = (teachersData as any)?.data || [];
    const totalCount = (classesData as any)?.meta?.total || 0;
    const totalPages = (classesData as any)?.meta?.totalPages || 1;

    // Sắp xếp classes theo thứ tự: draft → ready → active → suspended → completed → cancelled
    const statusOrder: Record<string, number> = {
      [ClassStatus.DRAFT]: 1,      // Chưa cập nhật
      [ClassStatus.READY]: 2,      // Đang tuyển sinh
      [ClassStatus.ACTIVE]: 3,     // Đang hoạt động
      [ClassStatus.SUSPENDED]: 4,  // Tạm dừng
      [ClassStatus.COMPLETED]: 5,  // Đã kết thúc
      [ClassStatus.CANCELLED]: 6,  // Đã hủy
    };

    const classes = [...classesRaw].sort((a: any, b: any) => {
      const orderA = statusOrder[a.status] || 999;
      const orderB = statusOrder[b.status] || 999;
      if (orderA !== orderB) {
        return orderA - orderB; // Sort asc: draft → ready → active → ...
      }
      // If same status, sort by createdAt desc (mới nhất trước)
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    // Stats
    const stats = {
        totalClasses: meta.total,
        activeClasses: classes.filter((c: any) => c.status === ClassStatus.ACTIVE).length,
        draftClasses: classes.filter((c: any) => c.status === ClassStatus.DRAFT).length,
        completedClasses: classes.filter((c: any) => c.status === ClassStatus.COMPLETED).length,
        readyClasses: classes.filter((c: any) => c.status === ClassStatus.READY).length,
        suspendedClasses: classes.filter((c: any) => c.status === ClassStatus.SUSPENDED).length
    };

    // Tabs
    const tabs = [
        { key: ClassStatus.ALL, label: 'Tất cả', count: meta.total },
        { key: ClassStatus.ACTIVE, label: CLASS_STATUS_LABELS[ClassStatus.ACTIVE], count: stats.activeClasses },
        { key: ClassStatus.READY, label: CLASS_STATUS_LABELS[ClassStatus.READY], count: stats.readyClasses },
        { key: ClassStatus.SUSPENDED, label: CLASS_STATUS_LABELS[ClassStatus.SUSPENDED], count: stats.suspendedClasses },
        { key: ClassStatus.DRAFT, label: CLASS_STATUS_LABELS[ClassStatus.DRAFT], count: stats.draftClasses },
        { key: ClassStatus.COMPLETED, label: CLASS_STATUS_LABELS[ClassStatus.COMPLETED], count: stats.completedClasses }
    ];


    const handleCreateClass = (data: any) => {
        navigate(`/center-qn/classes/create`);
    };

    const handleUpdateClass = (id: string, data: any) => {
        updateClass.mutate(
            { id, data },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setSelectedClass(null);
                }
            }
        );
    };

    const handleDeleteClass = (classItem: any) => {
        if (window.confirm(`Bạn có chắc muốn xóa lớp "${classItem?.name}"?`)) {
            deleteClass.mutate(classItem?.id);
        }
    };

    const handleEdit = (classItem: any) => {
        setSelectedClass(classItem);
        setIsEditDialogOpen(true);
    };

    const handleEditSchedule = (classItem: any) => {
        // Kiểm tra status trước khi cho phép chỉnh sửa
        if (classItem.status === ClassStatus.ACTIVE || classItem.status === ClassStatus.COMPLETED) {
            toast.error('Không thể chỉnh sửa lịch học cho lớp đang hoạt động. Vui lòng chuyển lớp sang trạng thái khác trước.');
            return;
        }
        
        setSelectedClass(classItem);
        setIsEditScheduleSheetOpen(true);
    };

    const handleScheduleSubmit = async (schedules: any[]) => {
        if (!selectedClass) return;
        
        try {
            // Lấy thông tin giáo viên hiện tại và năm học
            const currentTeacher = selectedClass.teacher;
            const requestData = {
                schedules: schedules,
                teacherId: currentTeacher?.id,
                academicYear: selectedClass.academicYear
            };
            const response = await classService.updateClassSchedule(selectedClass.id, requestData);
            
            if (response?.success) {
                toast.success('Cập nhật lịch học thành công!');
                // Refresh data
                refetch();
                setIsEditScheduleSheetOpen(false);
            } else {
                toast.error(response?.message || 'Có lỗi xảy ra khi cập nhật lịch học');
            }
        } catch (error: any) {
            console.error('Error updating schedule:', error);
            const errorMessage = error.response?.message || error.message || 'Có lỗi xảy ra khi cập nhật lịch học';
            toast.error(errorMessage);
        }
    };

    const handleView = (classItem: any) => {
        navigate(`/center-qn/classes/${classItem.id}`);
    };

    const handleViewLessons = (classItem: any) => {
        navigate(`/center-qn/classes/${classItem.id}#lessons`);
    };

    const handleAssignTeacher = (classItem: any) => {
        setSelectedClass(classItem);
        setIsAssignTeacherDialogOpen(true);
    };

    const handleAssignTeacherSubmit = (data: any) => {
        if (selectedClass) {
            assignTeacher.mutate(
                { classId: selectedClass?.id, data },
                {
                    onSuccess: () => {
                        setIsAssignTeacherDialogOpen(false);
                        setSelectedClass(null);
                    }
                }
            );
        }
    };

    const handleEnrollStudent = (studentIds: string[]) => {
        if (selectedClass) {
            bulkEnroll.mutate(
                {
                    studentIds,
                    classId: selectedClass?.id
                },
                {
                    onSuccess: () => {
                        setIsEnrollStudentDialogOpen(false);
                    }
                }
            );
        }
    };

    const handleOpenEnrollDialog = () => {
        setIsEnrollStudentDialogOpen(true);
    };

    const handleCloneClass = (classItem: any) => {
        setSelectedClass(classItem);
        setIsCloneDialogOpen(true);
    };

    const handleCloneSubmit = async (cloneData: any) => {
        if (!selectedClass) return;

        try {
            const response = await classService.cloneClass(selectedClass.id, cloneData);
            
            if (response?.success) {
                toast.success(`Clone lớp học thành công! Lớp mới: ${cloneData.name}`);
                refetch();
                setIsCloneDialogOpen(false);
                setSelectedClass(null);
            } else {
                toast.error(response?.message || 'Có lỗi xảy ra khi clone lớp học');
            }
        } catch (error: any) {
            console.error('Error cloning class:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi clone lớp học';
            toast.error(errorMessage);
        }
    };

    const handleRefreshPage = () => {
        setSearchTerm('');
        setDebouncedSearchTerm('');
        setSelectedStatus('all');
        setSelectedDay('all');
        setSelectedShift('all');
        setFilterTeacher('');
        setFilterCourse('');
        setFilterRoom('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterRating('');
        pagination.setCurrentPage(1);
        refetch();
    };

    const handleClearFilter = () => {
        setFilterTeacher('');
        setFilterCourse('');
        setFilterRoom('');
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterRating('');
    };


    const handleDownloadTemplate = () => {
        alert('Tải xuống mẫu...');
    };

    const handleUploadFile = () => {
        alert('Tải lên file...');
    };

    const handleDownloadAll = () => {
        alert('Tải xuống tất cả...');
    };

   const columns: Column<any>[] = [
    {
        key: "stt",
        header: "STT",
        width: "80px",
        align: "center",
        render: (item: any, index: number) => (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1
    },
        {
            key: 'name',
            header: 'Tên lớp',
            width: '120px',
            sortable: true,
            searchable: true,
            searchPlaceholder: 'Tìm tên lớp...',
            render: (item: any) => (
                <div className="space-y-1">
                    <div className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/center-qn/classes/${item.id}`)}>
                        {item.name}
                    </div>
                    {item.code && (
                        <CodeDisplay code={item.code} hiddenLength={4} />
                    )}
                </div>
            )
        },
        {
            key: 'schedule',
            header: 'Lịch học',
            width: '250px',
            render: (item: any) => {
                // Extract schedule từ Classes table với cấu trúc mới
                const schedules: string[] = [];
                if (item.recurringSchedule) {
                    // Cấu trúc mới: { schedules: [{ day, startTime, endTime }] }
                    if (item.recurringSchedule.schedules && Array.isArray(item.recurringSchedule.schedules)) {
                        item.recurringSchedule.schedules.forEach((schedule: any) => {
                            const dayNames: { [key: string]: string } = {
                                'monday': 'Thứ 2',
                                'tuesday': 'Thứ 3', 
                                'wednesday': 'Thứ 4',
                                'thursday': 'Thứ 5',
                                'friday': 'Thứ 6',
                                'saturday': 'Thứ 7',
                                'sunday': 'CN'
                            };
                            const dayName = dayNames[schedule.day] || schedule.day;
                            schedules.push(`${dayName}: ${schedule.startTime} → ${schedule.endTime}`);
                        });
                    } else {
                        // Fallback cho cấu trúc cũ
                        const formattedSchedule = formatSchedule(item.recurringSchedule);
                        schedules.push(...formattedSchedule);
                    }
                }
                
                return (
                    <div className="space-y-1">
                        {schedules.length > 0 ? (
                            schedules.map((schedule, idx) => (
                                <div key={idx} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 rounded-full bg-green-400 "></span>
                                    <span className="text-xs text-gray-600 dark:text-gray-300">{schedule}</span>
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400">-</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'subjectName',
            header: 'Môn học',
            sortable: true,
            searchable: true,   
            searchPlaceholder: 'Tìm môn học...',
            render: (item: any) => <span className="font-medium">{item.subjectName}</span>
        },
        {
            key: 'gradeName',
            header: 'Khối',
            sortable: true,
            render: (item: any) => item.gradeName ? `Khối ${item.gradeLevel}` : '-'
        },
        {
            key: 'teachers',
            width: '120px',
            header: 'Giáo viên',
            render: (item: any) => {
                if (item.teacher) {
                    const teacher = item.teacher;
                    return (
                        <div className="flex items-center gap-2">
                            <TooltipProvider delayDuration={300} key={teacher?.id}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <img 
                                            src={teacher.avatar || "https://picsum.photos/200/300"} 
                                            alt={teacher?.name || "Giáo viên"} 
                                            onClick={() => navigate(`/center-qn/teachers/${teacher.id}`)}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-3">
                                            <img 
                                                src={teacher.avatar || "https://picsum.photos/200/300"} 
                                                alt={teacher?.name || "Giáo viên"} 
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-lg">{teacher?.name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{teacher?.email}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{teacher?.phone}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Môn học:</span>
                                                    <p className="font-medium">{item.subjectName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Lớp:</span>
                                                    <p className="font-medium">{item.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    );
                }
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">-</span>
                    </div>
                );
            }
        },
        {
            key: 'roomName',
            header: 'Phòng',
            render: (item: any) => item.roomName || '-'
        },
        {
            key: 'maxStudents',
            header: 'Sĩ số',
            render: (item: any) => {
                return (
                    <div className="flex items-center gap-2">
                          <span className="text-sm">{item.currentStudents}</span>
                        <span className="text-sm">/</span>
                        <span className="text-sm ">{item.maxStudents}</span>
                    </div>
                )
            }
        },
        {
            key: 'sessions',
            header: 'Số buổi học',
            render: (item: any) => {
                return (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">{item.sessionsEnd ? item.sessionsEnd : "-"}</span>
                        <span className="text-sm">/</span>

                          <span className="text-sm">{item.sessions ? item.sessions : "-"}</span>
                          
                    </div>
                )
            }
        },
        {
            key: 'status',
            header: 'Trạng thái',
            sortable: true,
            render: (item: any) => getStatusBadge(item.status)
        },
        {
            key: 'actualStartDate-actualEndDate',
            header: 'Ngày bắt đầu & kết thúc',
            align: 'center',
            width: '220px',
            render: (item: any) => (
                <div className="text-sm space-y-1">
                    <div>
                        {item.actualStartDate ? formatDate(item.actualStartDate) : '-'}
                    </div>
                    <div>
                        {item.actualEndDate ? formatDate(item.actualEndDate) : '-'}
                    </div>
                </div>
            )
        },
        {
            key: 'actions',
            header: 'Thao tác',
            align: 'center',
            width: '140px',
            render: (item: any) => (
                <TooltipProvider delayDuration={300}>
                    <div className="flex items-center justify-center gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleView(item)}
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
                                    className="h-8 w-8"
                                    onClick={() => handleEditSchedule(item)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Sửa lịch học</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                    onClick={() => handleCloneClass(item)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Clone lớp học</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteClass(item)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xoá lớp học</TooltipContent>
                        </Tooltip>
                    </div>
                </TooltipProvider>
            )
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            {/* Breadcrumb */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-foreground">Danh sách lớp học</h1>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/center-qn" className="text-muted-foreground hover:text-foreground">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-foreground font-medium">Danh sách lớp học</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <Button onClick={handleCreateClass}>
                        <Plus className="w-4 h-4 mr-2" />
                        Lớp học
                    </Button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Thứ */}
                        <Select value={selectedDay} onValueChange={setSelectedDay}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Thứ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Thứ</SelectItem>
                                <SelectItem value="monday">Thứ Hai</SelectItem>
                                <SelectItem value="tuesday">Thứ Ba</SelectItem>
                                <SelectItem value="wednesday">Thứ Tư</SelectItem>
                                <SelectItem value="thursday">Thứ Năm</SelectItem>
                                <SelectItem value="friday">Thứ Sáu</SelectItem>
                                <SelectItem value="saturday">Thứ Bảy</SelectItem>
                                <SelectItem value="sunday">Chủ Nhật</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Ca học */}
                        <Select value={selectedShift} onValueChange={setSelectedShift}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Ca học" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Ca học</SelectItem>
                                <SelectItem value="morning">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span>Ca sáng (00:00 - 11:59)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="afternoon">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <span>Ca chiều (12:00 - 16:59)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="evening">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>Ca tối (17:00 - 23:59)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm theo mã lớp, tên lớp, môn học"
                                value={searchTerm}  
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                            {searchTerm !== debouncedSearchTerm && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2 bg-transparent">
                                    <Filter className="w-4 h-4" />
                                    Bộ lọc
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">Bộ lọc</h3>
                                        <Button variant="ghost" size="sm" onClick={handleClearFilter}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {/* Khối lớp (đa chọn) */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Khối lớp</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['6','7','8','9'].map(g => (
                                                    <label key={g} className="flex items-center gap-2 text-sm">
                                                        <Checkbox 
                                                            checked={selectedGrades.includes(g)} 
                                                            onCheckedChange={(checked: boolean) => {
                                                                setSelectedGrades(prev => checked ? Array.from(new Set([...prev, g])) : prev.filter(x => x !== g));
                                                            }}
                                                        />
                                                        <span>Khối {g}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Giáo viên phụ trách */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Giáo viên phụ trách</label>
                                            <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn giáo viên" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả</SelectItem>
                                                    {teachers && teachers.length > 0 && teachers.map((teacher: any) => (
                                                        <SelectItem key={teacher.id} value={teacher.id}>
                                                            {teacher.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* Phòng học */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Phòng học</label>
                                            <Select value={filterRoom} onValueChange={setFilterRoom}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn phòng" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả</SelectItem>
                                                    {rooms && rooms.length > 0 && rooms.map((room: any) => (
                                                        <SelectItem key={room.id} value={room.id}>
                                                            {room.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Ngày bắt đầu */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Ngày bắt đầu</label>
                                            <Input
                                                type="date"
                                                value={filterStartDate}
                                                onChange={(e) => setFilterStartDate(e.target.value)}
                                            />
                                        </div>

                                        {/* Ngày kết thúc */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Ngày kết thúc</label>
                                            <Input
                                                type="date"
                                                value={filterEndDate}
                                                onChange={(e) => setFilterEndDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem className="gap-2" onClick={handleDownloadTemplate}>
                                    <Download className="w-4 h-4" />
                                    Tải mẫu
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={handleUploadFile}>
                                    <Upload className="w-4 h-4" />
                                    Tải lên
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={handleRefreshPage}>
                                    <RefreshCw className="w-4 h-4" />
                                    Tải lại trang
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2" onClick={handleDownloadAll}>
                                    <Download className="w-4 h-4" />
                                    Tải tất cả
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                            </div>

            {/* Tabs and Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
                <div className="border-b">
                    <div className="flex">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setSelectedStatus(tab.key)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    selectedStatus === tab.key
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                {tab.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DataTable */}
                <DataTable
                    data={classes}
                    columns={columns}
                    loading={isLoadingClasses}
                    error={isError ? "Có lỗi xảy ra khi tải dữ liệu" : null}
                    onRetry={refetch}
                    emptyMessage="Không có lớp học nào"
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
                    enableSearch={false}
                    enableSort={false}
                />
                        </div>

            {/* Additional Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mt-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Switch checked={collectData} onCheckedChange={setCollectData} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Thu gọn</span>
                    </div>
                </div>
            </div>
            <EditScheduleSheet
                open={isEditScheduleSheetOpen}
                onOpenChange={setIsEditScheduleSheetOpen}
                classData={selectedClass}
                onSubmit={handleScheduleSubmit}
                isLoading={isLoadingClasses}
            />
            <CloneClassDialog
                open={isCloneDialogOpen}
                onOpenChange={setIsCloneDialogOpen}
                classData={selectedClass}
                onSubmit={handleCloneSubmit}
                isLoading={false}
            />
        </div>
    );
};
export default ClassManagement;
