import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, UserPlus, Search, Filter, MoreHorizontal, Download, Upload, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../utils/clientAxios';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Components
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { Badge } from '@/components/ui/badge';

import { EditScheduleSheet } from './components/EditScheduleSheet';
// import { EnrollStudentDialog } from './components/EnrollStudentDialog';

// Hooks
import { useClassesQuery } from './hooks/useClassesQuery';
import { useClassMutations } from './hooks/useClassMutations';
import { formatSchedule } from '../../../utils/format';
import { useEnrollmentMutations } from './hooks/useEnrollmentMutations';

// Types
import { ClassType } from '../../../services/center-owner/class-management/class.types';
import { EnrollmentType } from '../../../services/center-owner/enrollment/enrollment.types';
import { usePagination } from '../../../hooks/usePagination';

// Helper function to get status badge
const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
        draft: { variant: 'secondary', label: 'Đang chiêu sinh' },
        active: { variant: 'default', label: 'Hoạt động' },
        completed: { variant: 'outline', label: 'Hoàn thành' },
        deleted: { variant: 'destructive', label: 'Đã xóa' }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};

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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isEditScheduleSheetOpen, setIsEditScheduleSheetOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
    const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false);
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



    // Build complete filters object
    const completeFilters = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm.trim()  ,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        // Add other filters as needed
        dayOfWeek: selectedDay !== 'all' ? selectedDay : undefined,
        shift: selectedShift !== 'all' ? selectedShift : undefined,
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
                params: { limit: 100 }
            });
            return response;
        },
        staleTime: 0, // Cache for 5 minutes
        enabled: filterOpen // Only fetch when filter is open
    });

    // Mutations
    const { createClass, updateClass, deleteClass, assignTeacher } = useClassMutations();
    const { bulkEnroll } = useEnrollmentMutations();
    
    // Data 
    const classes = (classesData as any)?.data || [];
    const meta = (classesData as any)?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 };
    const subjects = (subjectsData as any)?.data || [];
    const rooms = (roomsData as any)?.data || [];
    const teachers = (teachersData as any)?.data || [];
    const totalCount = (classesData as any)?.meta?.total || 0;
    const totalPages = (classesData as any)?.meta?.totalPages || 1;
    
    console.log(teachers);
    
    // Stats
    const stats = {
        totalClasses: meta.total,
        activeClasses: classes.filter((c: any) => c.status === 'active').length,
        draftClasses: classes.filter((c: any) => c.status === 'draft').length,
        completedClasses: classes.filter((c: any) => c.status === 'completed').length
    };

    // Tabs
    const tabs = [
        { key: 'all', label: 'Tất cả', count: meta.total },
        { key: 'active', label: 'Đang hoạt động', count: stats.activeClasses },
        { key: 'draft', label: 'Nháp', count: stats.draftClasses },
        { key: 'completed', label: 'Hoàn thành', count: stats.completedClasses }
    ];

    // Handlers
    const handleFilterChange = (newFilters: any) => {
        pagination.setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        pagination.setCurrentPage(page);
    };

    const handleCreateClass = (data: any) => {
        navigate(`/center-qn/classes/add`);
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
        setSelectedClass(classItem);
        setIsEditScheduleSheetOpen(true);
    };

    const handleScheduleSubmit = (schedules: any[]) => {
        console.log('Updating schedules:', schedules);
        // TODO: Call API to update schedules
        setIsEditScheduleSheetOpen(false);
    };

    const handleView = (classItem: any) => {
        setSelectedClass(classItem);
        setIsDetailDialogOpen(true);
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
        render: (item: any, index: number) => index + 1
    },
        {
            key: 'name',
            header: 'Tên lớp',
            width: '250px',
            sortable: true,
            searchable: true,
            searchPlaceholder: 'Tìm tên lớp...',
            render: (item: any) => (
                <div className="space-y-1">
                    <div className="font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/center-qn/classes/${item.id}`)}>
                        {item.name}
                    </div>
                    {item.academicYear && (
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                            {item.academicYear}
                        </div>
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
                            schedules.push(`${dayName}: ${schedule.startTime}-${schedule.endTime}`);
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
                                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                                    {schedule}
                                </div>
                            ))
                        ) : (
                            <span className="text-xs text-gray-400">Chưa có lịch</span>
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
        // {
        //     key: 'grade',
        //     header: 'Khối',
        //     sortable: true,
        //     render: (item: any) => item.grade ? `Lớp ${item.grade}` : '-'
        // },
        {
            key: 'teachers',
            header: 'Giáo viên',
            render: (item: any) => item.teachers && item.teachers.length > 0 ? item.teachers[0].name : '-'
        },
        {
            key: 'roomName',
            header: 'Phòng',
            render: (item: any) => item.roomName || '-'
        },
        // {
        //     key: 'students',
        //     header: 'Sĩ số',
        //     align: 'center',
        //     render: (item: any) => (
        //         <span className={item.currentStudents >= (item.maxStudents || 0) ? 'text-red-600 font-semibold' : ''}>
        //             {item.currentStudents}/{item.maxStudents || '∞'}
        //         </span>
        //     )
        // },
        {
            key: 'status',
            header: 'Trạng thái',
            sortable: true,
            render: (item: any) => getStatusBadge(item.status)
        },
        {
            key: 'actions',
            header: '',
            align: 'center',
            width: '80px',
            render: (item: any) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem 
                            className="gap-2 cursor-pointer" 
                            onClick={() => handleView(item)}
                        >
                            <Eye className="w-4 h-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                            onClick={() => handleEditSchedule(item)}
                        >
                            <Edit className="w-4 h-4" />
                            Sửa lịch học
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Edit className="w-4 h-4" />
                            Chương trình học
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="gap-2 cursor-pointer"
                            onClick={() => handleAssignTeacher(item)}
                        >
                            <UserPlus className="w-4 h-4" />
                            Cập nhật chương trình học theo khoá học
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            className="gap-2 cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                            onClick={() => handleDeleteClass(item)}
                        >
                            <Trash2 className="w-4 h-4" />
                            Xoá
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                    <Button onClick={() => navigate('/center-qn/classes/create')}>
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
                                placeholder="Tìm kiếm theo tên lớp, môn học"
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

                                        {/* Khoá học */}
                                        <div>
                                            <label className="text-sm text-gray-600 dark:text-gray-300 mb-1 block">Khoá học</label>
                                            <Select value={filterCourse} onValueChange={setFilterCourse}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn khoá học" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Tất cả</SelectItem>
                                                    <SelectItem value="2024-1">Học kỳ 1 (2024-2025)</SelectItem>
                                                    <SelectItem value="2024-2">Học kỳ 2 (2024-2025)</SelectItem>
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
        </div>
    );
};
export default ClassManagement;


