import { useState, useRef, useEffect, useMemo } from 'react';
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
  Calendar, // Thêm icon Calendar
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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DataTable, type Column } from '../../../components/common/Table/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getClassByTeacherId, getCountByStatus } from '../../../services/teacher-service/manage-class.service';
import { ApiResponse } from '../../../types/response';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../../utils/format';
import { useNavigate } from 'react-router-dom';

//draft, active, completed, cancelled
const statusColors = {
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
}

const daysOfWeek = [
  { value: 'all', label: 'Tất cả' },
  { value: 'monday', label: 'Thứ Hai' },
  { value: 'tuesday', label: 'Thứ Ba' },
  { value: 'wednesday', label: 'Thứ Tư' },
  { value: 'thursday', label: 'Thứ Năm' },
  { value: 'friday', label: 'Thứ Sáu' },
  { value: 'saturday', label: 'Thứ Bảy' },
  { value: 'sunday', label: 'Chủ Nhật' },
];

const fetchClassData = async ( 
  { status, page, limit, searchQuery, academicYear }: { 
    status: string,
    page: number,
    limit: number,
    searchQuery?: string,
    academicYear?: string,
  }
) => {
  const res = await getClassByTeacherId( status, page, limit, searchQuery, academicYear);
  return res;
};

const fetchCountData = async () => {
  const res = await getCountByStatus();
  return res.data;
};

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all'); // Thêm state cho academic year
  const [debouncedAcademicYear, setDebouncedAcademicYear] = useState('all'); // Debounced academic year
  const navigate = useNavigate()

  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  

    const academicYears = [
    { value: 'all', label: 'Tất cả năm học' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' },
  ];
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 200); // 200ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce academic year
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAcademicYear(selectedAcademicYear);
    }, 200); // 200ms delay

    return () => clearTimeout(timer);
  }, [selectedAcademicYear]);

  // Reset trang khi đổi tab hoặc thay đổi filter
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearchQuery, debouncedAcademicYear]); // Thêm debouncedAcademicYear

  // Query để lấy danh sách lớp học
  const { 
    data: listClassResponse, 
    isLoading, 
    isError,
    isFetching 
  } = useQuery({
    queryKey: ["class", activeTab, currentPage, pageSize, debouncedSearchQuery, debouncedAcademicYear], // Thêm academic year vào queryKey
    queryFn: () => fetchClassData({
      status: activeTab, 
      page: currentPage, 
      limit: pageSize,
      searchQuery: debouncedSearchQuery,
      academicYear: debouncedAcademicYear === 'all' ? undefined : debouncedAcademicYear // Thêm academic year
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes  
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Tắt refetch khi component mount
    refetchOnReconnect: false, // Tắt refetch khi reconnect
    retry: 1, // Only retry once if failed
  });

  // Query để lấy số lượng theo trạng thái
  const { 
    data: countData,
    isLoading: isCountLoading 
  } = useQuery({
    queryKey: ["classCount"],
    queryFn: () => fetchCountData(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Tạo statusTabs từ dữ liệu API
  const statusTabs = [
    { key: 'all', label: 'Tất cả', count: countData?.total || 0, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700' },
    { key: 'active', label: 'Đang diễn ra', count: countData?.active || 0, color: 'bg-green-100 text-green-700' },
    { key: 'completed', label: 'Đã kết thúc', count: countData?.completed || 0, color: 'bg-blue-100 text-blue-700' },
    { key: 'draft', label: 'Chưa diễn ra', count: countData?.draft || 0, color: 'bg-yellow-100 text-yellow-700' },
    { key: 'cancelled', label: 'Đã Hủy', count: countData?.cancelled || 0, color: 'bg-red-100 text-red-700' },
  ];

  // Khi có lỗi hoặc không có dữ liệu, hiển thị danh sách rỗng
  const classesToRender = (isError || !listClassResponse?.data) ? [] : (Array.isArray(listClassResponse.data) ? listClassResponse.data : []);
  const pagination = listClassResponse?.meta?.pagination || null;
  const appliedFilters = listClassResponse?.meta?.filters || null;
  
  // Debug info
  
  const formatDayToVietnamese = (dateStr: string)=> {
    const dayFormat = daysOfWeek.find(day => day.value === dateStr);
    return dayFormat ? dayFormat.label : dateStr;
  }

  // Columns configuration cho DataTable
  const columns: Column<any>[] = useMemo(() => [
    {
      key: 'index',
      header: 'STT',
      width: '80px',
      align: 'center',
      render: (item: any, index: number) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      key: 'name',
      header: 'Tên lớp học',
      sortable: true,
      searchable: true,
      searchPlaceholder: 'Tìm theo tên lớp...',
      render: (item: any) => (
        <div 
          onClick={() => navigate(`/teacher/classes/${item.assignmentId}`)} 
          className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer transition-colors duration-200"
        >
          {item.name}
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Lịch học',
      render: (item: any) => (
        <div className="space-y-1">
          {item?.schedule?.schedules?.map((schedule: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-1 text-sm"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>
                {formatDayToVietnamese(schedule?.day)} - {schedule?.startTime} <ArrowRight className="inline-block" size={14} /> {schedule?.endTime}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'assignmentStatus',
      header: 'Trạng thái',
      sortable: true,
      render: (item: any) => (
        <Badge
          variant="secondary"
          className={`${statusColors[item.assignmentStatus as keyof typeof statusColors]} hover:bg-red-200 transition-colors duration-200`}
        >
          {statusTabs.find(tab => tab.key === item.assignmentStatus)?.label || item.assignmentStatus}
        </Badge>
      ),
    },
    {
      key: 'dates',
      header: 'Ngày bắt đầu / Ngày kết thúc',
      render: (item: any) => (
        <div className="text-sm space-y-1">
          <div>{formatDate(item.startDate)}</div>
          <div>{formatDate(item.endDate)}</div>
        </div>
      ),
    },
    {
      key: 'enrollmentStatus',
      header: 'Số học sinh trong lớp',
      align: 'center',
      render: (item: any) => (
        <span className="font-medium">{item.enrollmentStatus.current}/{item.enrollmentStatus.max}</span>
      ),
    },
  ], [currentPage, pageSize, navigate, statusTabs])

  // Hàm xử lý chuyển trang với smooth scroll
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of table
    document.querySelector('.table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Hàm xóa tất cả filter
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedAcademicYear('all'); // Reset academic year
    setActiveTab('all');
    setCurrentPage(1);
  };

  console.log(classesToRender);
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1  className="text-2xl font-semibold text-foreground">
            Danh sách lớp học
          </h1>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">
              Dashboard
            </span>
            <span>•</span>
            {/* <span className="hover:text-foreground cursor-pointer transition-colors duration-200">
              Tài khoản
            </span>
            <span>•</span> */}
            <span className="text-foreground">Danh sách lớp học</span>
          </nav>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Lớp học
        </Button>
      </div>

      {/* Search and Filters Section - CẬP NHẬT */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp học"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {searchQuery && searchQuery !== debouncedSearchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Academic Year Filter - MỚI */}
        <div className="relative min-w-[200px]">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
          <Select 
            value={selectedAcademicYear} 
            onValueChange={setSelectedAcademicYear}
          >
            <SelectTrigger className="pl-10 transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white">
              <SelectValue placeholder="Chọn năm học" />
            </SelectTrigger>
            <SelectContent>
              {academicYears?.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-transparent"
        >
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>

        {/* Clear Filters Button - CẬP NHẬT */}
        {(searchQuery || activeTab !== 'all' || selectedAcademicYear !== 'all') && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 bg-transparent text-red-500 border-red-300"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Filter Status Info - CẬP NHẬT */}
      {(debouncedSearchQuery || debouncedAcademicYear !== 'all') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Filter className="h-4 w-4" />
              <span>Đang lọc:</span>
              {debouncedSearchQuery && (
                <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                  Tìm kiếm: "{debouncedSearchQuery}"
                </span>
              )}
              {debouncedAcademicYear !== 'all' && (
                <span className="bg-blue-100 px-2 py-1 rounded text-xs">
                  Năm học: {academicYears.find(y => y.value === debouncedAcademicYear)?.label}
                </span>
              )}
            </div>
            <div className="text-sm text-blue-600">
              {pagination ? `${pagination.totalCount} kết quả` : '0 kết quả'}
            </div>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="border-b border-border relative">
        <div className="flex px-4 relative">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              ref={(el) => (tabRefs.current[tab.key] = el)}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 pb-3 px-1 relative transition-all duration-300 ease-out transform hover:scale-105 ${
                activeTab === tab.key
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <span className="transition-all duration-200">{tab.label}</span>
              {activeTab === tab.key && isFetching && (
                <></>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center transition-all duration-200 ${
                  tab.color
                }`}
              >
                {isCountLoading ? '...' : tab.count}
              </span>
            </button>
          ))}

          <div
            className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
            style={{
              width: `${underlineStyle.width}px`,
              left: `${underlineStyle.left}px`,
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <DataTable
          data={classesToRender}
          columns={columns}
          loading={isLoading && classesToRender.length === 0}
          error={isError ? "Không thể tải dữ liệu lớp học" : null}
          emptyMessage="Không có lớp học nào"
          rowKey="assignmentId"
          hoverable={true}
          striped={false}
          enableSearch={false} // Disable built-in search vì đã có search riêng
          enableSort={false} // Disable built-in sort vì đã có sort riêng
          pagination={{
            currentPage,
            totalPages: pagination?.totalPages || 1,
            totalItems: pagination?.totalCount || 0,
            itemsPerPage: pageSize,
            onPageChange: handlePageChange,
            onItemsPerPageChange: (newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            },
            showItemsPerPage: true,
            showPageInfo: true,
          }}
          className={`transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-60' : 'opacity-100'}`}
        />
      </div>

      {/* Additional Actions Section */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="collapse-mode"
              checked={isCollapsed}
              onCheckedChange={setIsCollapsed}
              className="transition-all duration-200"
            />
            <label
              htmlFor="collapse-mode"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground cursor-pointer"
            >
              Thu gọn
            </label>
          </div>
          
          {/* Loading indicator */}
          {(isLoading || isFetching) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}