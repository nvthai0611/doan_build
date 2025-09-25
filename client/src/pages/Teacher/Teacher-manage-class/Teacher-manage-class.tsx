'use client';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { getClassByTeacherId } from '../../../services/teacher-service/manage-class.service';
import { ApiResponse } from '../../../types/response';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '../../../utils/format';

const statusTabs = [
  { key: 'all', label: 'Tất cả', count: 1 },
  { key: 'active', label: 'Đang diễn ra', count: 0 },
  { key: 'completed', label: 'Đã kết thúc', count: 1 },
  { key: 'draft', label: 'Chưa diễn ra', count: 0 },
  { key: 'cancelled', label: 'Đã Hủy', count: 0 },
];

//draft, active, completed, cancelled
const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
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

const fetchClassData = async (status: string) => {
  const res = await getClassByTeacherId(status);
  // Đảm bảo chỉ return data, không set state.
  // Giả định res.data là mảng lớp học (any[])
  return res.data;
};

export default function ClassManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [underlineStyle, setUnderlineStyle] = useState({ width: 0, left: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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

  const { 
    data: listClassResponse, 
    isLoading, 
    isError,
    isFetching 
  } = useQuery({
    queryKey: ["class", activeTab],
    queryFn: () => fetchClassData(activeTab),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes  
    refetchOnWindowFocus: false,
    retry: 1, // Only retry once if failed
  });

  

  // Khi có lỗi hoặc không có dữ liệu, hiển thị danh sách rỗng
  const classesToRender = (isError || !listClassResponse) ? [] : (Array.isArray(listClassResponse) ? listClassResponse : []); 
  const formatDayToVietnamese = (dateStr: string)=> {
    const dayFormat = daysOfWeek.find(day => day.value === dateStr);
    return dayFormat ? dayFormat.label : dateStr;
  }
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            Danh sách lớp học
          </h1>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">
              Dashboard
            </span>
            <span>•</span>
            <span className="hover:text-foreground cursor-pointer transition-colors duration-200">
              Tài khoản
            </span>
            <span>•</span>
            <span className="text-foreground">Danh sách lớp học</span>
          </nav>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200">
          <Plus className="w-4 h-4 mr-2" />
          Lớp học
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-32 transition-all duration-200 hover:border-blue-300 focus:border-blue-500">
            <SelectValue placeholder="Thứ" />
          </SelectTrigger>
          <SelectContent>
            {daysOfWeek.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-32 transition-all duration-200 hover:border-blue-300 focus:border-blue-500">
            <SelectValue placeholder="Ca học" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="morning">Sáng</SelectItem>
            <SelectItem value="afternoon">Chiều</SelectItem>
            <SelectItem value="evening">Tối</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors duration-200" />
          <Input
            placeholder="Tìm kiếm theo tên, mã lớp học"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <Button
          variant="outline"
          className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-transparent"
        >
          <Filter className="h-4 w-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

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
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="transition-all duration-200">{tab.label}</span>
              {activeTab === tab.key && isFetching && (
                // <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <></>
              )}
              <span
                className={`text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}
              >
                {tab.count}
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

      <div className="border rounded-lg transition-all duration-200 hover:shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16">STT</TableHead>
              <TableHead>Tên lớp học</TableHead>
              <TableHead>Lịch học</TableHead>
              {/* <TableHead>Khóa học</TableHead> */}
              <TableHead>Trạng thái</TableHead>
              <TableHead>
                Ngày bắt đầu
                <br />
                Ngày kết thúc
              </TableHead>
              {/* <TableHead>Giáo viên phụ trách</TableHead> */}
              <TableHead>Số học sinh trong lớp</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && classesToRender.length === 0 ? (
              // Only show skeleton on initial load, not when there's already data
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-muted-foreground">Đang tải...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : classesToRender.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {isError ? "Không thể tải dữ liệu lớp học" : "Không có lớp học nào"}
                </TableCell>
              </TableRow>
            ) : (
              classesToRender.map((classItem: any, index: number) => (
              <TableRow
                key={classItem.id}
                className="hover:bg-muted/50 transition-colors duration-200"
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-blue-600 font-medium hover:text-blue-700 cursor-pointer transition-colors duration-200">
                      {classItem.name}
                    </div>
                    {/* <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {classItem.classCode}
                      <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-[10px]">
                        📋
                      </span>
                    </div> */}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {classItem.recurringSchedule.days.map((schedule: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-sm"
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>
                          {formatDayToVietnamese(schedule)} - {classItem.recurringSchedule.startTime} <ArrowRightIcon /> {classItem.recurringSchedule.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                {/* <TableCell>
                  <div className="space-y-1">
                    <div>{classItem.course}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {classItem.courseCode}
                      <span className="w-4 h-4 bg-muted rounded flex items-center justify-center text-[10px]">
                        📋
                      </span>
                    </div>
                  </div>
                </TableCell> */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={` ${statusColors[classItem.status as keyof typeof statusColors] } hover:bg-red-200 transition-colors duration-200`}
                  >
                    {statusTabs.find(tab => tab.key === classItem.status)?.label || classItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div>{formatDate(classItem.startDate)}</div>
                    <div>{formatDate(classItem.endDate)}</div>
                  </div>
                </TableCell>
                {/* <TableCell>
                  <div className="flex -space-x-2">
                    {classItem.teachers.map((teacher, idx) => (
                      <Avatar key={idx} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                        <AvatarFallback className="text-xs">{teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell> */}
                <TableCell>
                  <span className="font-medium">{classItem._count.enrollments}/{classItem.maxStudents}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0 hover:bg-muted transition-colors duration-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Edit className="mr-2 h-4 w-4" />
                        Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 transition-colors duration-200">
                        <Copy className="mr-2 h-4 w-4" />
                        Sao chép
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer hover:bg-red-50 text-red-600 transition-colors duration-200">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa lớp học
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>

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

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Số hàng mỗi trang:
            </span>
            <Select defaultValue="10">
              <SelectTrigger className="w-16 h-8 transition-all duration-200 hover:border-blue-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">1-1 trong 1</span>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="transition-all duration-200 bg-transparent"
              >
                ‹
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="transition-all duration-200 bg-transparent"
              >
                ›
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ArrowRightIcon = (props: any) => {
  const { 
    width = '1em', 
    height = '1em', 
    color = 'currentColor',
    strokeWidth = '1.5',
    ...rest
  } = props;

  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color}
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={strokeWidth}
      role="img"
      aria-hidden={props['aria-hidden'] || false}
      style={{display: 'inline-block', verticalAlign: 'middle'}}
      {...rest}
    >
      {/* Đây là phần đường dẫn (path) của SVG gốc */}
      <path d="M18.5 12H5m8 6s6-4.419 6-6s-6-6-6-6" />
    </svg>
  );
};
