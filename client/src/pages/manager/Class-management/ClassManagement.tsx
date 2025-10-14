"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  Copy,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../../utils/clientAxios"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Components
<<<<<<< Updated upstream
import { DataTable, Column } from '../../../components/common/Table/DataTable';
import { Badge } from '@/components/ui/badge';

import { EditScheduleSheet } from './components/EditScheduleSheet';
// import { EnrollStudentDialog } from './components/EnrollStudentDialog';
=======
import { DataTable, type Column } from "../../../components/common/Table/DataTable"
import { Badge } from "@/components/ui/badge"
import { EditScheduleSheet } from "./components/EditScheduleSheet"
>>>>>>> Stashed changes

// Hooks
import { useClassesQuery } from "./hooks/useClassesQuery"
import { useClassMutations } from "./hooks/useClassMutations"
import { formatSchedule } from "../../../utils/format"
import { useEnrollmentMutations } from "./hooks/useEnrollmentMutations"
import { usePagination } from "../../../hooks/usePagination"

const getStatusBadge = (status: string) => {
<<<<<<< Updated upstream
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
        draft: { variant: 'secondary', label: 'Đang chiêu sinh' },
        active: { variant: 'default', label: 'Hoạt động' },
        completed: { variant: 'outline', label: 'Hoàn thành' },
        deleted: { variant: 'destructive', label: 'Đã xóa' }
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
};
=======
  const variants: Record<string, { className: string; label: string }> = {
    draft: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Chưa diễn ra" },
    active: { className: "bg-green-50 text-green-700 border-green-200", label: "Đang diễn ra" },
    completed: { className: "bg-gray-100 text-gray-700 border-gray-200", label: "Đã kết thúc" },
    not_started: { className: "bg-orange-50 text-orange-700 border-orange-200", label: "Chưa diễn ra" },
    not_updated: { className: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Chưa cập nhật" },
    deleted: { className: "bg-red-50 text-red-700 border-red-200", label: "Đã xóa" },
  }
  const config = variants[status] || variants.draft
  return (
    <Badge variant="outline" className={`${config.className} font-normal px-3 py-1`}>
      {config.label}
    </Badge>
  )
}
>>>>>>> Stashed changes

export const ClassManagement = () => {
  const navigate = useNavigate()

<<<<<<< Updated upstream
    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
            if (searchTerm !== debouncedSearchTerm) {
                pagination.setCurrentPage(1);
            }
        }, 500);
=======
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedDay, setSelectedDay] = useState("all")
  const [selectedShift, setSelectedShift] = useState("all")
  const [filterOpen, setFilterOpen] = useState(false)
  const [collectData, setCollectData] = useState(false)
  const [filterTeacher, setFilterTeacher] = useState("")
  const [filterCourse, setFilterCourse] = useState("")
  const [filterRoom, setFilterRoom] = useState("")
  const [filterStartDate, setFilterStartDate] = useState("")
  const [filterEndDate, setFilterEndDate] = useState("")
  const [filterRating, setFilterRating] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditScheduleSheetOpen, setIsEditScheduleSheetOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false)
  const [isEnrollStudentDialogOpen, setIsEnrollStudentDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<any>(null)
>>>>>>> Stashed changes

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      if (searchTerm !== debouncedSearchTerm) {
        pagination.setCurrentPage(1)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const completeFilters = {
    page: pagination.currentPage,
    limit: pagination.itemsPerPage,
    search: debouncedSearchTerm,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    dayOfWeek: selectedDay !== "all" ? selectedDay : undefined,
    shift: selectedShift !== "all" ? selectedShift : undefined,
  }

<<<<<<< Updated upstream
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
=======
  const { data: classesData, isLoading: isLoadingClasses, isError, refetch } = useClassesQuery(completeFilters)
>>>>>>> Stashed changes

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await apiClient.get("/subjects")
      return response
    },
<<<<<<< Updated upstream
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
=======
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
>>>>>>> Stashed changes

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await apiClient.get("/rooms")
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await apiClient.get("/admin-center/teachers", {
        params: { limit: 100 },
      })
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const { createClass,updateClass, updateClassSchedule, deleteClass, assignTeacher } = useClassMutations()
  const { bulkEnroll } = useEnrollmentMutations()

  const classes = (classesData as any)?.data || []
  const meta = (classesData as any)?.meta || { total: 0, page: 1, limit: 10, totalPages: 0 }
  const subjects = (subjectsData as any)?.data || []
  const rooms = (roomsData as any)?.data || []
  const teachers = (teachersData as any)?.data || []
  const totalCount = (classesData as any)?.meta?.total || 0
  const totalPages = (classesData as any)?.meta?.totalPages || 1

  const stats = {
    totalClasses: meta.total,
    activeClasses: classes.filter((c: any) => c.status === "active").length,
    draftClasses: classes.filter((c: any) => c.status === "draft").length,
    completedClasses: classes.filter((c: any) => c.status === "completed").length,
    notStartedClasses: classes.filter((c: any) => c.status === "not_started").length,
    notUpdatedClasses: classes.filter((c: any) => c.status === "not_updated").length,
  }

  const tabs = [
    { key: "all", label: "Tất cả", count: meta.total },
    { key: "active", label: "Đang diễn ra", count: stats.activeClasses },
    { key: "completed", label: "Đã kết thúc", count: stats.completedClasses },
    { key: "draft", label: "Chưa diễn ra", count: stats.draftClasses },
    { key: "not_updated", label: "Chưa cập nhật", count: stats.notUpdatedClasses },
  ]

  const handleFilterChange = (newFilters: any) => {
    pagination.setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    pagination.setCurrentPage(page)
  }

  const handleCreateClass = (data: any) => {
    navigate(`/center-qn/classes/add`)
  }

  const handleUpdateClass = (id: string, data: any) => {
    updateClass.mutate(
      { id, data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false)
          setSelectedClass(null)
        },
      },
    )
  }

  const handleDeleteClass = (classItem: any) => {
    if (window.confirm(`Bạn có chắc muốn xóa lớp "${classItem?.name}"?`)) {
      deleteClass.mutate(classItem?.id)
    }
  }

  const handleEdit = (classItem: any) => {
    setSelectedClass(classItem)
    setIsEditDialogOpen(true)
  }

  const handleEditSchedule = (classItem: any) => {
    setSelectedClass(classItem)
    setIsEditScheduleSheetOpen(true)
  }

  const handleScheduleSubmit = (schedules: any[]) => {
    const data = {
      schedules,
      teacherId: selectedClass?.teachers[0]?.id,
      academicYear: selectedClass?.academicYear
    }
    console.log(data);
    
    try {
        updateClassSchedule.mutate(
        { id: selectedClass?.id, data: data },
        {
          onSuccess: () => {
            setIsEditScheduleSheetOpen(false)
          },
        },
      )
    } catch (error) {
      
    } finally {
      setIsEditScheduleSheetOpen(false)
    }
  }

  const handleView = (classItem: any) => {
    setSelectedClass(classItem)
    setIsDetailDialogOpen(true)
  }

  const handleAssignTeacher = (classItem: any) => {
    setSelectedClass(classItem)
    setIsAssignTeacherDialogOpen(true)
  }

  const handleAssignTeacherSubmit = (data: any) => {
    if (selectedClass) {
      assignTeacher.mutate(
        { classId: selectedClass?.id, data },
        {
          onSuccess: () => {
            setIsAssignTeacherDialogOpen(false)
            setSelectedClass(null)
          },
        },
      )
    }
  }

  const handleEnrollStudent = (studentIds: string[]) => {
    if (selectedClass) {
      bulkEnroll.mutate(
        {
          studentIds,
          classId: selectedClass?.id,
        },
        {
          onSuccess: () => {
            setIsEnrollStudentDialogOpen(false)
          },
        },
      )
    }
  }

  const handleOpenEnrollDialog = () => {
    setIsEnrollStudentDialogOpen(true)
  }

  const handleRefreshPage = () => {
    setSearchTerm("")
    setDebouncedSearchTerm("")
    setSelectedStatus("all")
    setSelectedDay("all")
    setSelectedShift("all")
    setFilterTeacher("")
    setFilterCourse("")
    setFilterRoom("")
    setFilterStartDate("")
    setFilterEndDate("")
    setFilterRating("")
    pagination.setCurrentPage(1)
    refetch()
  }

  const handleClearFilter = () => {
    setFilterTeacher("")
    setFilterCourse("")
    setFilterRoom("")
    setFilterStartDate("")
    setFilterEndDate("")
    setFilterRating("")
  }

  const handleDownloadTemplate = () => {
    alert("Tải xuống mẫu...")
  }

  const handleUploadFile = () => {
    alert("Tải lên file...")
  }

  const handleDownloadAll = () => {
    alert("Tải xuống tất cả...")
  }

  const columns: Column<any>[] = [
    {
      key: "stt",
      header: "STT",
      width: "60px",
      align: "center",
      render: (item: any, index: number) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {(pagination.currentPage - 1) * pagination.itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      key: "name",
      header: "Tên lớp học",
      width: "200px",
      sortable: true,
      render: (item: any) => (
        <div className="space-y-1">
          <div
            className="font-semibold text-blue-600 dark:text-blue-400 cursor-pointer hover:underline text-sm"
            onClick={() => handleView(item)}
          >
            {item.name}
          </div>
          {item.code && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">{item.code}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => navigator.clipboard.writeText(item.code)}
              >
                <Copy className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
<<<<<<< Updated upstream

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
=======
          )}
>>>>>>> Stashed changes
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Lịch học",
      width: "220px",
      render: (item: any) => {
        const schedules: string[] = []
        if (item.teachers && item.teachers.length > 0) {
          item.teachers.forEach((teacher: any) => {
            if (teacher.recurringSchedule) {
              const formattedSchedule = formatSchedule(teacher.recurringSchedule)
              schedules.push(...formattedSchedule)
            }
          })
        }

        return (
          <div className="space-y-1.5">
            {schedules.length > 0 ? (
              schedules.map((schedule, idx) => (
                <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {schedule}
                </div>
              ))
            ) : (
              <span className="text-xs text-gray-400">Chưa có lịch</span>
            )}
          </div>
        )
      },
    },
    {
      key: "subjectName",
      header: "Khóa học",
      width: "180px",
      sortable: true,
      render: (item: any) => (
        <div className="space-y-0.5">
          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.subjectName}</div>
          {item.grade && (
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Copy className="h-3 w-3" />
              <span>Lớp {item.grade}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      width: "140px",
      sortable: true,
      render: (item: any) => getStatusBadge(item.status),
    },
    {
      key: "dates",
      header: "Ngày bắt đầu\nNgày kết thúc",
      width: "240px",
      render: (item: any) => {
        const teacher = item.teachers && item.teachers.length > 0 ? item.teachers[0] : null
        return teacher ? (
          <div className="space-y-1 text-xs">
          <div className="text-gray-700 dark:text-gray-300">
            {teacher?.startDate ? new Date(teacher?.startDate).toLocaleDateString("vi-VN") : "-"}
          </div>
          <div className="text-gray-700 dark:text-gray-300">
            {teacher?.endDate ? new Date(teacher?.endDate).toLocaleDateString("vi-VN") : "-"}
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Chưa phân công</span>
        )
      },

    },
    {
      key: "progress",
      header: "Tiến độ",
      align: "center",
      width: "100px",
      render: (item: any) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {item.progress || 0}/{item.totalLessons || 0}
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <span className="text-xs text-gray-500">
              {item.totalLessons ? Math.round(((item.progress || 0) / item.totalLessons) * 100) : 0}%
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "teacher",
      header: "Giáo viên phụ trách",
      width: "180px",
      render: (item: any) => {
        const teacher = item.teachers && item.teachers.length > 0 ? item.teachers[0] : null
        return teacher ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
            </Avatar>
            <span className="text-sm text-gray-700 dark:text-gray-300">{teacher.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Chưa phân công</span>
        )
      },
    },
    {
      key: "students",
      header: "Tài khoản học viên\nđang hoạt động",
      align: "center",
      width: "320px",
      render: (item: any) => (
        <span
          className={`text-sm font-medium ${
            item.currentStudents >= (item.maxStudents || 0)
              ? "text-red-600 dark:text-red-400"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          {item.currentStudents || 0}
        </span>
      ),
    },
    {
      key: "room",
      header: "Phòng học",
      width: "100px",
      render: (item: any) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.roomName || "-"}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "center",
      width: "60px",
      render: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(item)}>
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEditSchedule(item)}>
              <Edit className="w-4 h-4" />
              Sửa lịch học
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit className="w-4 h-4" />
              Chương trình học
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleAssignTeacher(item)}>
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
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Danh sách lớp học</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/center-qn"
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                    Danh sách lớp học
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <Button
            onClick={() => navigate("/center-qn/classes/create")}
            className="shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm lớp học
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-40 h-9 text-sm">
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

            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Ca học" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ca học</SelectItem>
                <SelectItem value="morning">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Ca sáng</span>
                  </div>
                </SelectItem>
                <SelectItem value="afternoon">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Ca chiều</span>
                  </div>
                </SelectItem>
                <SelectItem value="evening">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Ca tối</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo tên lớp, môn học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm"
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
                <Button variant="outline" size="sm" className="gap-2 h-9 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Bộ lọc
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Bộ lọc nâng cao</h3>
                    <Button variant="ghost" size="sm" onClick={handleClearFilter} className="h-8 text-xs">
                      Xóa bộ lọc
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Giáo viên phụ trách
                      </label>
                      <Select value={filterTeacher} onValueChange={setFilterTeacher}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Chọn giáo viên" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {teachers &&
                            teachers.length > 0 &&
                            teachers.map((teacher: any) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Khoá học
                      </label>
                      <Select value={filterCourse} onValueChange={setFilterCourse}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Chọn khoá học" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="2024-1">Học kỳ 1 (2024-2025)</SelectItem>
                          <SelectItem value="2024-2">Học kỳ 2 (2024-2025)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                        Phòng học
                      </label>
                      <Select value={filterRoom} onValueChange={setFilterRoom}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Chọn phòng" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {rooms &&
                            rooms.length > 0 &&
                            rooms.map((room: any) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Ngày bắt đầu
                        </label>
                        <Input
                          type="date"
                          value={filterStartDate}
                          onChange={(e) => setFilterStartDate(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                          Ngày kết thúc
                        </label>
                        <Input
                          type="date"
                          value={filterEndDate}
                          onChange={(e) => setFilterEndDate(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="gap-2 text-sm" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4" />
                  Tải mẫu
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-sm" onClick={handleUploadFile}>
                  <Upload className="w-4 h-4" />
                  Tải lên
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-sm" onClick={handleRefreshPage}>
                  <RefreshCw className="w-4 h-4" />
                  Tải lại trang
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 text-sm" onClick={handleDownloadAll}>
                  <Download className="w-4 h-4" />
                  Tải tất cả
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all relative ${
                  selectedStatus === tab.key
                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                    selectedStatus === tab.key
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
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
              showPageInfo: true,
            }}
            rowKey="id"
            hoverable={true}
            enableSearch={false}
            enableSort={false}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch
              checked={collectData}
              onCheckedChange={setCollectData}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Thu gọn dữ liệu</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Hiển thị {classes.length} trên tổng số {totalCount} lớp học
          </div>
        </div>
      </div>

      {/* Dialogs - keeping existing functionality */}
      <EditScheduleSheet
        open={isEditScheduleSheetOpen}
        onOpenChange={setIsEditScheduleSheetOpen}
        classData={selectedClass}
        onSubmit={handleScheduleSubmit}
        isLoading={isLoadingClasses}
      />
    </div>
  )
}

export default ClassManagement
