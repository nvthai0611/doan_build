import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DataTable,
  Column,
  PaginationConfig,
} from '../../../../components/common/Table/DataTable';
import {
  StudentStatus,
  STUDENT_STATUS_LABELS,
  STUDENT_STATUS_COLORS,
} from '../../../../lib/constants';
import { SelectStudentSheet } from './Sheet/SelectStudentSheet';
import { useQuery } from '@tanstack/react-query';
import { enrollmentService } from '../../../../services/center-owner/enrollment/enrollment.service';
import { useDebounce } from '../../../../hooks/useDebounce';
import { usePagination } from '../../../../hooks/usePagination';

interface StudentsInfoProps {
  classId: string;
  classData?: any;
}

export const StudentsInfo = ({ classId, classData }: StudentsInfoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  // Remove local page state; use shared pagination hook instead
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSelectStudentOpen, setIsSelectStudentOpen] = useState(false);
  // Local copy of students to support UI toggles
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);

  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0,
  });
  // Fetch enrollments students in class
  const {
    data: studentsResp,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      'class-enrollments',
      {
        classId,
        q: debouncedSearch,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      },
    ],
    queryFn: () =>
      enrollmentService.getStudentsByClass(classId, {
        search: debouncedSearch?.trim() ? debouncedSearch : undefined,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
      }),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Sync state when API data changes
  useEffect(() => {
    const apiEnrollments = (studentsResp as any)?.data;
    if (Array.isArray(apiEnrollments)) {
      const mapped = apiEnrollments.map((enrollment: any) => {
        const s = enrollment?.student || {};
        const u = s?.user || {};
        const p = s?.parent || {};
        const pu = p?.user || {};
        // Map backend status to UI status if needed
        // active -> studying, completed -> graduated, withdrawn -> stopped
        const statusMap: any = {
          active: 'studying',
          completed: 'graduated',
          withdrawn: 'stopped',
        };
        return {
          // stable identifiers
          id: s.id || enrollment.id,
          studentId: s.studentCode || s.id,
          fullName: u.fullName || s.fullName || '-',
          email: u.email || '-',
          phone: u.phone || '-',
          avatar: u.avatar || '',
          parentFullName: pu.fullName || p.fullName || '-',
          parentEmail: pu.email || '-',
          parentPhone: pu.phone || '-',
          enrolledAt: enrollment.enrolledAt,
          status: statusMap[enrollment.status] || enrollment.status || 'pending',
          classesAttended: enrollment.classesAttended ?? 0,
          classesRegistered: enrollment.classesRegistered ?? 0,
          accountStatus: u.isActive ? 'active' : 'inactive',
          graduationStatus:
            (enrollment.status === 'completed') ? 'graduated' : 'not_graduated',
        };
      });
      setStudentsData(mapped);
    }
  }, [studentsResp]);

  // Reset to first page when search changes
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [debouncedSearch]);
  const totalCount = (studentsResp as any)?.meta?.total || 0;
  const totalPages = (studentsResp as any)?.meta?.totalPages || 1;

  // Status filters với counts
  const statusFilters = [
    {
      key: StudentStatus.ALL,
      label: STUDENT_STATUS_LABELS[StudentStatus.ALL],
      count: studentsData.length || 0,
    },
    {
      key: StudentStatus.PENDING,
      label: STUDENT_STATUS_LABELS[StudentStatus.PENDING],
      count: studentsData.filter((s: any) => s.status === StudentStatus.PENDING)
        .length,
    },
    // {
    //   key: StudentStatus.UPCOMING,
    //   label: STUDENT_STATUS_LABELS[StudentStatus.UPCOMING],
    //   count: studentsData.filter(
    //     (s: any) => s.status === StudentStatus.UPCOMING,
    //   ).length,
    // },
    {
      key: StudentStatus.STUDYING,
      label: STUDENT_STATUS_LABELS[StudentStatus.STUDYING],
      count: studentsData.filter(
        (s: any) => s.status === StudentStatus.STUDYING,
      ).length,
    },
    {
      key: StudentStatus.RESERVED,
      label: STUDENT_STATUS_LABELS[StudentStatus.RESERVED],
      count: studentsData.filter(
        (s: any) => s.status === StudentStatus.RESERVED,
      ).length,
    },
    {
      key: StudentStatus.STOPPED,
      label: STUDENT_STATUS_LABELS[StudentStatus.STOPPED],
      count: studentsData.filter((s: any) => s.status === StudentStatus.STOPPED)
        .length,
    },
    {
      key: StudentStatus.GRADUATED,
      label: STUDENT_STATUS_LABELS[StudentStatus.GRADUATED],
      count: studentsData.filter(
        (s: any) => s.status === StudentStatus.GRADUATED,
      ).length,
    },
  ];

  // Filter students based on active filter
  const filteredStudents = studentsData?.filter((student: any) => {
    if (activeStatusFilter === StudentStatus.ALL) return true;
    return student.status === activeStatusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        label: string;
        className?: string;
      }
    > = {
      [StudentStatus.STUDYING]: {
        variant: 'default',
        label: STUDENT_STATUS_LABELS[StudentStatus.STUDYING],
        className: STUDENT_STATUS_COLORS[StudentStatus.STUDYING],
      },
      // [StudentStatus.UPCOMING]: {
      //   variant: 'secondary',
      //   label: STUDENT_STATUS_LABELS[StudentStatus.UPCOMING],
      //   className: STUDENT_STATUS_COLORS[StudentStatus.UPCOMING],
      // },
      [StudentStatus.RESERVED]: {
        variant: 'outline',
        label: STUDENT_STATUS_LABELS[StudentStatus.RESERVED],
        className: STUDENT_STATUS_COLORS[StudentStatus.RESERVED],
      },
      [StudentStatus.STOPPED]: {
        variant: 'destructive',
        label: STUDENT_STATUS_LABELS[StudentStatus.STOPPED],
        className: STUDENT_STATUS_COLORS[StudentStatus.STOPPED],
      },
      [StudentStatus.GRADUATED]: {
        variant: 'default',
        label: STUDENT_STATUS_LABELS[StudentStatus.GRADUATED],
        className: STUDENT_STATUS_COLORS[StudentStatus.GRADUATED],
      },
      [StudentStatus.PENDING]: {
        variant: 'outline',
        label: STUDENT_STATUS_LABELS[StudentStatus.PENDING],
        className: STUDENT_STATUS_COLORS[StudentStatus.PENDING],
      },
    };
    const config = variants[status] || variants[StudentStatus.STUDYING];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getAccountStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
    ) : (
      <Badge variant="destructive">Không hoạt động</Badge>
    );
  };

  const getGraduationStatusBadge = (status: string) => {
    return status === 'graduated' ? (
      <Badge className="bg-purple-100 text-purple-800">Đã tốt nghiệp</Badge>
    ) : (
      <Badge variant="outline">Chưa tốt nghiệp</Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '60px',
      align: 'center',
      render: (_: any, index: number) =>
        (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    },
    {
      key: 'student',
      header: 'Tài khoản học viên',
      width: '250px',
      render: (student: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={student.avatar} alt={student.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(student.fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{student.fullName}</p>
            <p className="text-sm text-gray-500">
              ID: {student.studentId || student.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'parentInfo',
      header: 'Phụ huynh',
      width: '260px',
      render: (student: any) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{student.parentFullName || '-'}</div>
          <div className="text-gray-500">{student.parentEmail || '-'}</div>
          <div className="text-gray-500">{student.parentPhone || '-'}</div>
        </div>
      )
    },
    {
      key: 'studyStatus',
      header: 'Trạng thái học tập',
      width: '150px',
      render: (student: any) => getStatusBadge(student.status),
    },
    {
      key: 'classes',
      header: 'Buổi đã học/đăng ký',
      width: '150px',
      align: 'center',
      render: (student: any) => (
        <div className="text-center">
          <p className="font-medium">
            {student.classesAttended ?? 0}/{student.classesRegistered ?? 0}
          </p>
        </div>
      ),
    },
    {
      key: 'startDate',
      header: 'Ngày bắt đầu học',
      width: '120px',
      render: (student: any) =>
        student.enrolledAt
          ? format(new Date(student.enrolledAt), 'dd/MM/yyyy')
          : '-',
    },
    // {
    //   key: 'endDate',
    //   header: 'Ngày kết thúc học',
    //   width: '120px',
    //   render: (student: any) => student.endDate ? format(new Date(student.endDate), 'dd/MM/yyyy') : '-'
    // },
    {
      key: 'componentScore',
      header: 'Điểm thành phần buổi học',
      width: '180px',
      align: 'center',
      render: (student: any) => (
        <div className="text-center">
          <p className="font-medium">{student.componentScore || 0}</p>
        </div>
      ),
    },
    {
      key: 'averageScore',
      header: 'Điểm trung bình',
      width: '120px',
      align: 'center',
      render: (student: any) => (
        <div className="text-center">
          <p className="font-medium">{student.averageScore || 0}</p>
        </div>
      ),
    },
    {
      key: 'accountStatus',
      header: 'Trạng thái tài khoản',
      width: '150px',
      render: (student: any) => (
        <Switch
          checked={student.accountStatus === 'active'}
          onCheckedChange={(checked) => {
            setStudentsData((prev) =>
              prev.map((s) =>
                s.id === student.id
                  ? { ...s, accountStatus: checked ? 'active' : 'inactive' }
                  : s,
              ),
            );
          }}
        />
      ),
    },
    {
      key: 'graduationStatus',
      header: 'Trạng thái tốt nghiệp',
      width: '150px',
      render: (student: any) => (
        <Switch
          checked={student.graduationStatus === 'graduated'}
          onCheckedChange={(checked) => {
            setStudentsData((prev) =>
              prev.map((s) =>
                s.id === student.id
                  ? {
                      ...s,
                      graduationStatus: checked ? 'graduated' : 'not_graduated',
                    }
                  : s,
              ),
            );
          }}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (student: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
            <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
            <DropdownMenuItem>Điểm danh</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Xóa khỏi lớp
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                Danh sách tài khoản học viên
              </h1>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsSelectStudentOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Học viên
              </Button>
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
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Ngày bắt đầu học
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-48"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Ngày kết thúc học
                  </label>
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
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Nhập tên học viên"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div className="border-b">
            <div className="flex">
              {statusFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveStatusFilter(filter.key)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeStatusFilter === filter.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white'
                  }`}
                >
                  {filter.label}{' '}
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {filter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* DataTable */}
          <DataTable
            data={filteredStudents}
            columns={columns}
            loading={isLoading}
            error={isError ? 'Có lỗi xảy ra khi tải dữ liệu' : null}
            onRetry={() => window.location.reload()}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: totalPages,
              totalItems: totalCount,
              itemsPerPage: pagination.itemsPerPage,
              onPageChange: pagination.setCurrentPage,
              onItemsPerPageChange: pagination.setItemsPerPage,
              showItemsPerPage: true,
              showPageInfo: true,
            }} // Disable default pagination
            emptyMessage="Không có dữ liệu"
            className="shadow-sm"
          />
        </div>
      </div>
      <SelectStudentSheet
        open={isSelectStudentOpen}
        onOpenChange={setIsSelectStudentOpen}
        classData={classData}
        onSubmit={() => {}}
      />
    </>
  );
};
