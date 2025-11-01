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
  Ban,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DataTable,
  Column,
  PaginationConfig,
} from '../../../../components/common/Table/DataTable';
import {
  ClassStatus,
  ENROLLMENT_STATUS_COLORS,
  ENROLLMENT_STATUS_LABELS,
  EnrollmentStatus,
  STUDENT_STATUS_LABELS,
} from '../../../../lib/constants';
import { SelectStudentSheet } from './Sheet/SelectStudentSheet';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { enrollmentService } from '../../../../services/center-owner/enrollment/enrollment.service';
import { centerOwnerStudentService } from '../../../../services/center-owner/student-management/student.service';
import { useDebounce } from '../../../../hooks/useDebounce';
import { usePagination } from '../../../../hooks/usePagination';
import { CodeDisplay } from '../../../../components/common/CodeDisplay';
import { useToast } from '../../../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface StudentsInfoProps {
  classId: string;
  classData?: any;
}

export const StudentsInfo = ({ classId, classData }: StudentsInfoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [isSelectStudentOpen, setIsSelectStudentOpen] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  // Reset to first page when search changes
  useEffect(() => {
    pagination.setCurrentPage(1);
  }, [debouncedSearch]);
  
  // Lấy data trực tiếp từ API
  const enrollments = (studentsResp as any)?.data || [];
  const totalCount = (studentsResp as any)?.meta?.total || 0;
  const totalPages = (studentsResp as any)?.meta?.totalPages || 1;

  // Mutation để update enrollment status với optimistic update
  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: string }) =>
      enrollmentService.updateStatus(enrollmentId, { status }),
    onMutate: async ({ enrollmentId, status }) => {
      // Query key hiện tại
      const queryKey = [
        'class-enrollments',
        {
          classId,
          q: debouncedSearch,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
      ];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((enrollment: any) =>
            enrollment.id === enrollmentId
              ? { ...enrollment, status }
              : enrollment
          ),
        };
      });
      
      return { previousData, queryKey };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái tốt nghiệp. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái tốt nghiệp thành công",
      });
    },
    onSettled: () => {
      // Invalidate all queries that start with 'class-enrollments'
      queryClient.invalidateQueries({ queryKey: ['class-enrollments'] });
    },
  });

  // Mutation để update student account status với optimistic update
  const updateStudentStatusMutation = useMutation({
    mutationFn: ({ studentId, isActive }: { studentId: string; isActive: boolean }) =>
      centerOwnerStudentService.updateStudentStatus(studentId, isActive),
    onMutate: async ({ studentId, isActive }) => {
      // Query key hiện tại
      const queryKey = [
        'class-enrollments',
        {
          classId,
          q: debouncedSearch,
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
        },
      ];
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((enrollment: any) =>
            enrollment?.student?.id === studentId
              ? {
                  ...enrollment,
                  student: {
                    ...enrollment.student,
                    user: {
                      ...enrollment.student.user,
                      isActive,
                    },
                  },
                }
              : enrollment
          ),
        };
      });
      
      return { previousData, queryKey };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái tài khoản thành công",
      });
    },
    onSettled: () => {
      // Invalidate all queries that start with 'class-enrollments'
      queryClient.invalidateQueries({ queryKey: ['class-enrollments'] });
    },
  });

  // Status filters với counts
  const statusFilters = [
    {
      key: EnrollmentStatus.ALL,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.ALL] || '',
      count: enrollments.length || 0,
    },
    { 
      key: EnrollmentStatus.NOT_BEEN_UPDATED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.NOT_BEEN_UPDATED] || '',
      count: enrollments.filter((enrollment: any) => enrollment.status === EnrollmentStatus.NOT_BEEN_UPDATED).length || 0,
    },
    {
      key: EnrollmentStatus.STUDYING,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STUDYING],
      count: enrollments.filter(
        (enrollment: any) => enrollment.status === EnrollmentStatus.STUDYING,
      ).length,
    },
   
    {
      key: EnrollmentStatus.STOPPED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STOPPED],
      count: enrollments.filter((enrollment: any) => enrollment.status === EnrollmentStatus.STOPPED)
        .length,
    },
    {
      key: EnrollmentStatus.GRADUATED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.GRADUATED],
      count: enrollments.filter(
        (enrollment: any) => enrollment.status === EnrollmentStatus.GRADUATED,
      ).length,
    },
  ];

  // Filter students based on active filter
  const filteredStudents = enrollments?.filter((enrollment: any) => {
    if (activeStatusFilter === EnrollmentStatus.ALL) return true;
    return enrollment.status === activeStatusFilter;
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
      [EnrollmentStatus.NOT_BEEN_UPDATED]: {
        variant: 'default',
        label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.NOT_BEEN_UPDATED],
        className: ENROLLMENT_STATUS_COLORS[EnrollmentStatus.NOT_BEEN_UPDATED],
      },
      [EnrollmentStatus.STUDYING]: {
        variant: 'default',
        label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STUDYING],
        className: ENROLLMENT_STATUS_COLORS[EnrollmentStatus.STUDYING],
      },
      [EnrollmentStatus.STOPPED]: {
        variant: 'destructive',
        label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STOPPED],
        className: ENROLLMENT_STATUS_COLORS[EnrollmentStatus.STOPPED],
      },
      [EnrollmentStatus.GRADUATED]: {
        variant: 'default',
        label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.GRADUATED],
        className: ENROLLMENT_STATUS_COLORS[EnrollmentStatus.GRADUATED],
      },
    };
    const config = variants[status] || variants[EnrollmentStatus.NOT_BEEN_UPDATED];
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

  // Define columns for DataTable - Sử dụng trực tiếp enrollment data từ backend
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
      render: (enrollment: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={enrollment?.student?.user?.avatar} alt={enrollment?.student?.user?.fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600" >
              <p className="text-sm text-center text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/center-qn/students/${enrollment?.student?.id}`)}>{getInitials(enrollment?.student?.user?.fullName || 'NA')}</p>
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{enrollment?.student?.user?.fullName || '-'}</p>
            <div className="text-sm text-gray-500">
              <CodeDisplay
                code={enrollment?.student?.studentCode || '-'}
                hiddenLength={4}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'parentInfo',
      header: 'Phụ huynh',
      width: '260px',
      render: (enrollment: any) => (
        <div className="space-y-1 text-sm">
          <div className="font-medium">{enrollment?.student?.parent?.user?.fullName || '-'}</div>
          <div className="text-gray-500">{enrollment?.student?.parent?.user?.email || '-'}</div>
          <div className="text-gray-500">{enrollment?.student?.parent?.user?.phone || '-'}</div>
        </div>
      )
    },
    {
      key: 'studyStatus',
      header: 'Trạng thái học tập',
      width: '150px',
      render: (enrollment: any) => getStatusBadge(enrollment?.status),
    },
    {
      key: 'classes',
      header: 'Buổi đã học/Tổng buổi',
      width: '150px',
      align: 'center',
      render: (enrollment: any) => (
        <div className="text-center">
          <p className="font-medium">
            {enrollment?.classesAttended ?? 0}/{enrollment?.classesRegistered ?? 0}
          </p>
        </div>
      ),
    },
    // {
    //   key: 'enrolledDate',
    //   header: 'Ngày tham gia lớp',
    //   width: '120px',
    //   render: (enrollment: any) =>
    //     enrollment?.enrolledAt
    //       ? format(new Date(enrollment.enrolledAt), 'dd/MM/yyyy')
    //       : '-',
    // },
    // {
    //   key: 'startDate',
    //   header: 'Ngày bắt đầu/Ngày kết thúc',
    //   width: '200px',
    //   render: (enrollment: any) =>
    //     enrollment?.startDate && enrollment?.endDate
    //       ? `${format(new Date(enrollment.startDate), 'dd/MM/yyyy')} - ${format(new Date(enrollment.endDate), 'dd/MM/yyyy')}`
    //       : '-',
    // },
    // {
    //   key: 'endDate',
    //   header: 'Ngày kết thúc học',
    //   width: '120px',
    //   render: (enrollment: any) => enrollment.endDate ? format(new Date(enrollment.endDate), 'dd/MM/yyyy') : '-'
    // },
    {
      key: 'accountStatus',
      header: 'Trạng thái tài khoản',
      width: '150px',
      render: (enrollment: any) => {
        const isActive = enrollment?.student?.user?.isActive === true;
        return (
          <div className="flex items-center gap-2">
            <Switch 
              className='data-[state=checked]:bg-green-500'
              checked={isActive}
              onCheckedChange={(checked) => {
                updateStudentStatusMutation.mutate({
                  studentId: enrollment?.student?.id,
                  isActive: checked,
                });
              }}
              disabled={updateStudentStatusMutation.isPending}
            />
            <span className="text-sm">
              {isActive ? 'Hoạt động' : 'Không hoạt động'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'graduationStatus',
      header: 'Trạng thái tốt nghiệp',
      width: '150px',
      render: (enrollment: any) => {
        const isGraduated = enrollment?.status === EnrollmentStatus.GRADUATED;
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={isGraduated}
              onCheckedChange={(checked) => {
                const newStatus = checked ? EnrollmentStatus.GRADUATED : EnrollmentStatus.STUDYING;
                updateEnrollmentMutation.mutate({
                  enrollmentId: enrollment.id,
                  status: newStatus,
                });
              }}
              disabled={updateEnrollmentMutation.isPending}
            />
            <span className="text-sm">
              {isGraduated ? 'Đã tốt nghiệp' : 'Chưa tốt nghiệp'}
            </span>
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (enrollment: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Xem hồ sơ</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Ban className="h-4 w-4 mr-2" />
              Ngưng học
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
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
              <Button 
                onClick={() => setIsSelectStudentOpen(true)}
                disabled={classData?.status === ClassStatus.DRAFT}
                title={classData?.status === ClassStatus.DRAFT ? 'Lớp cần có lịch học và giáo viên (status READY) trước khi thêm học viên' : ''}
              >
                <Plus className="h-4 w-4 mr-2" />
                Học viên
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, SĐT học viên, mã học viên, hoặc thông tin phụ huynh..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                  {ENROLLMENT_STATUS_LABELS[filter.key as EnrollmentStatus]}{' '}
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
        onSubmit={() => {
          // Refetch enrollments data after successful bulk enroll
          queryClient.invalidateQueries({ queryKey: ['class-enrollments', { classId }] });
        }}
      />
    </>
  );
};
