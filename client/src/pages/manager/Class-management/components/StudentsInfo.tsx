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
  User,
  ArrowRight,
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
import { TransferStudentSheet } from './Sheet/TransferStudentSheet';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { enrollmentService } from '../../../../services/center-owner/enrollment/enrollment.service';
import { centerOwnerStudentService } from '../../../../services/center-owner/student-management/student.service';
import { useDebounce } from '../../../../hooks/useDebounce';
import { usePagination } from '../../../../hooks/usePagination';
import { CodeDisplay } from '../../../../components/common/CodeDisplay';
import { useToast } from '../../../../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface StudentsInfoProps {
  classId: string;
  classData?: any;
}

export const StudentsInfo = ({ classId, classData }: StudentsInfoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [isSelectStudentOpen, setIsSelectStudentOpen] = useState(false);
  const [isTransferStudentOpen, setIsTransferStudentOpen] = useState(false);
  const [selectedEnrollments, setSelectedEnrollments] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
    totalItems: 0,
  });
  
  // Fetch tất cả enrollments students in class (không pagination từ backend)
  const {
    data: studentsResp,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      'class-enrollments',
      classId,
      classData?.academicYear,
    ],
    queryFn: () =>
      enrollmentService.getStudentsByClass(classId, {
        page: 1,
        limit: 999, // Lấy hết tất cả enrollments
      }),
    enabled: !!classId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Lấy tất cả data từ API
  const allEnrollments = (studentsResp as any)?.data || [];

  // Filter enrollments ở FE
  const filteredEnrollments = allEnrollments.filter((enrollment: any) => {
    // Filter by status
    if (activeStatusFilter !== EnrollmentStatus.ALL && enrollment.status !== activeStatusFilter) {
      return false;
    }

    // Filter by search term
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      const studentName = (enrollment?.student?.user?.fullName || '').toLowerCase();
      const studentCode = (enrollment?.student?.studentCode || '').toLowerCase();
      const studentEmail = (enrollment?.student?.user?.email || '').toLowerCase();
      const studentPhone = (enrollment?.student?.user?.phone || '').toLowerCase();
      const parentName = (enrollment?.student?.parent?.user?.fullName || '').toLowerCase();
      const parentEmail = (enrollment?.student?.parent?.user?.email || '').toLowerCase();
      const parentPhone = (enrollment?.student?.parent?.user?.phone || '').toLowerCase();
      
      if (!studentName.includes(searchLower) && 
          !studentCode.includes(searchLower) &&
          !studentEmail.includes(searchLower) &&
          !studentPhone.includes(searchLower) &&
          !parentName.includes(searchLower) &&
          !parentEmail.includes(searchLower) &&
          !parentPhone.includes(searchLower)) {
        return false;
      }
    }

    return true;
  });

  // Pagination ở FE
  const totalCount = filteredEnrollments.length;
  const totalPages = Math.ceil(totalCount / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const endIndex = startIndex + pagination.itemsPerPage;
  const enrollments = filteredEnrollments.slice(startIndex, endIndex);

  // Update pagination total items when data changes
  useEffect(() => {
    // Đảm bảo currentPage không vượt quá totalPages
    if (pagination.currentPage > totalPages && totalPages > 0) {
      pagination.setCurrentPage(totalPages);
    }
  }, [totalCount, totalPages]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    pagination.setCurrentPage(1);
    setSelectedEnrollments([]);
  }, [debouncedSearch, activeStatusFilter]);

  // Reset selection when class status is not READY
  useEffect(() => {
    if (classData?.status !== ClassStatus.READY) {
      setSelectedEnrollments([]);
    }
  }, [classData?.status]);

  // Mutation để update enrollment status
  const updateEnrollmentMutation = useMutation({
    mutationFn: ({ enrollmentId, status }: { enrollmentId: string; status: string }) =>
      enrollmentService.updateStatus(enrollmentId, { status }),
    onError: (error) => {
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
      refetch();
    },
  });

  // State cho confirmation dialogs
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResumeConfirm, setShowResumeConfirm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  // Mutation để xóa enrollment
  const deleteEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      enrollmentService.deleteEnrollment(enrollmentId),
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error?.response?.data?.message || "Không thể xóa học sinh khỏi lớp. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã xóa học sinh khỏi lớp",
      });
      setShowDeleteConfirm(false);
      setSelectedEnrollment(null);
      refetch();
    },
  });

  // Mutation để update student account status
  const updateStudentStatusMutation = useMutation({
    mutationFn: ({ studentId, isActive }: { studentId: string; isActive: boolean }) =>
      centerOwnerStudentService.updateStudentStatus(studentId, isActive),
    onError: (error) => {
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
      refetch();
    },
  });

  // Status filters với counts từ allEnrollments
  const statusFilters = [
    {
      key: EnrollmentStatus.ALL,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.ALL] || '',
      count: allEnrollments.length || 0,
    },
    { 
      key: EnrollmentStatus.NOT_BEEN_UPDATED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.NOT_BEEN_UPDATED] || '',
      count: allEnrollments.filter((enrollment: any) => enrollment.status === EnrollmentStatus.NOT_BEEN_UPDATED).length || 0,
    },
    {
      key: EnrollmentStatus.STUDYING,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STUDYING],
      count: allEnrollments.filter(
        (enrollment: any) => enrollment.status === EnrollmentStatus.STUDYING,
      ).length,
    },
   
    {
      key: EnrollmentStatus.STOPPED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.STOPPED],
      count: allEnrollments.filter((enrollment: any) => enrollment.status === EnrollmentStatus.STOPPED)
        .length,
    },
    {
      key: EnrollmentStatus.GRADUATED,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.GRADUATED],
      count: allEnrollments.filter(
        (enrollment: any) => enrollment.status === EnrollmentStatus.GRADUATED,
      ).length,
    },
    {
      key: EnrollmentStatus.WITHDRAWN,
      label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.WITHDRAWN],
      count: allEnrollments.filter(
        (enrollment: any) => enrollment.status === EnrollmentStatus.WITHDRAWN,
      ).length,
    },
  ];

  // filteredStudents là enrollments đã được paginate (cho table)
  const filteredStudents = enrollments;

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
      [EnrollmentStatus.WITHDRAWN]: {
        variant: 'destructive',
        label: ENROLLMENT_STATUS_LABELS[EnrollmentStatus.WITHDRAWN],
        className: ENROLLMENT_STATUS_COLORS[EnrollmentStatus.WITHDRAWN],
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
            <DropdownMenuItem
              onClick={() => navigate(`/center-qn/students/${enrollment?.student?.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              Xem hồ sơ
            </DropdownMenuItem>
            {enrollment?.status === EnrollmentStatus.STOPPED ? (
              <DropdownMenuItem
                className="text-green-600"
                onClick={() => {
                  setSelectedEnrollment(enrollment);
                  setShowResumeConfirm(true);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Quay trở lại học
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setSelectedEnrollment(enrollment);
                  setShowStopConfirm(true);
                }}
              >
                <Ban className="h-4 w-4 mr-2" />
                Ngưng học
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-blue-600"
              onClick={() => {
                setSelectedEnrollment(enrollment);
                setIsTransferStudentOpen(true);
              }}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Chuyển lớp
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
                disabled={classData?.status === ClassStatus.DRAFT || classData?.status === ClassStatus.COMPLETED}
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

          {/* Selection Bar - Thanh hiển thị khi có items được chọn */}
          {selectedEnrollments.length > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
              <div className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedEnrollments.length === filteredEnrollments.length && filteredEnrollments.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const allIds = filteredEnrollments.map((enrollment: any) => enrollment.id);
                        setSelectedEnrollments(allIds);
                      } else {
                        setSelectedEnrollments([]);
                      }
                    }}
                  />
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                    Đã chọn {selectedEnrollments.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                  onClick={() => setIsTransferStudentOpen(true)}
                  title="Chuyển lớp cho các học sinh đã chọn"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Chuyển lớp
                </Button>
              </div>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            data={filteredStudents}
            columns={columns}
            loading={isLoading}
            error={isError ? 'Có lỗi xảy ra khi tải dữ liệu' : null}
            onRetry={refetch}
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
            emptyMessage="Không có dữ liệu"
            className="shadow-sm"
            enableCheckbox={true}
            selectedItems={selectedEnrollments}
            onSelectionChange={setSelectedEnrollments}
            getItemId={(item: any) => item.id}
            allData={filteredEnrollments}
          />
        </div>
      </div>
      <SelectStudentSheet
        open={isSelectStudentOpen}
        onOpenChange={setIsSelectStudentOpen}
        classData={classData}
        onSubmit={() => {
          // Refetch enrollments data after successful bulk enroll
          refetch();
          queryClient.invalidateQueries({ queryKey: ['class-enrollments'] });
        }}
      />

      {/* Transfer Student Sheet */}
      <TransferStudentSheet
        open={isTransferStudentOpen}
        onOpenChange={(open) => {
          setIsTransferStudentOpen(open);
          if (!open) {
            // Reset selection when closing
            if (selectedEnrollment) {
              setSelectedEnrollment(null);
            } else {
              // If bulk transfer, reset selected enrollments
              setSelectedEnrollments([]);
            }
          }
        }}
        classData={classData}
        selectedEnrollmentIds={
          selectedEnrollment
            ? [selectedEnrollment.id]
            : selectedEnrollments
        }
        allEnrollments={allEnrollments}
        onSuccess={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ['class-enrollments'] });
          setSelectedEnrollments([]);
          setSelectedEnrollment(null);
        }}
      />

      {/* Stop Enrollment Confirmation Dialog */}
      <AlertDialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ngưng học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ngưng học cho học sinh{' '}
              <strong>{selectedEnrollment?.student?.user?.fullName}</strong> không?
              <br />
              Học sinh sẽ chuyển sang trạng thái "Ngưng học" và không thể tiếp tục học trong lớp này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowStopConfirm(false);
              setSelectedEnrollment(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedEnrollment) {
                  updateEnrollmentMutation.mutate({
                    enrollmentId: selectedEnrollment.id,
                    status: EnrollmentStatus.STOPPED,
                  });
                  setShowStopConfirm(false);
                  setSelectedEnrollment(null);
                }
              }}
              disabled={updateEnrollmentMutation.isPending}
            >
              {updateEnrollmentMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resume Enrollment Confirmation Dialog */}
      <AlertDialog open={showResumeConfirm} onOpenChange={setShowResumeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận quay trở lại học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn cho học sinh{' '}
              <strong>{selectedEnrollment?.student?.user?.fullName}</strong> quay trở lại học không?
              <br />
              Học sinh sẽ chuyển từ trạng thái "Ngưng học" sang "Đang học" và có thể tiếp tục học trong lớp này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowResumeConfirm(false);
              setSelectedEnrollment(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedEnrollment) {
                  updateEnrollmentMutation.mutate({
                    enrollmentId: selectedEnrollment.id,
                    status: EnrollmentStatus.STUDYING,
                  });
                  setShowResumeConfirm(false);
                  setSelectedEnrollment(null);
                }
              }}
              disabled={updateEnrollmentMutation.isPending}
            >
              {updateEnrollmentMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Enrollment Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa học sinh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa học sinh{' '}
              <strong>{selectedEnrollment?.student?.user?.fullName}</strong> khỏi lớp này không?
              <br />
              <span className="text-red-600 font-medium">
                Hành động này không thể hoàn tác. Học sinh sẽ bị xóa khỏi lớp và mất tất cả dữ liệu liên quan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setSelectedEnrollment(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (selectedEnrollment) {
                  deleteEnrollmentMutation.mutate(selectedEnrollment.id);
                }
              }}
              disabled={deleteEnrollmentMutation.isPending}
            >
              {deleteEnrollmentMutation.isPending ? 'Đang xử lý...' : 'Xác nhận xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
