import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';

import { usePagination } from '@/hooks/usePagination';
import { ParentService } from '@/services/center-owner/parent-management/parent.service';
import { DataTable, Column } from '@/components/common/Table/DataTable';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type ParentListResponse = {
  data: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const getStudentCount = (parent: any) =>
  parent?.studentCount ?? parent?.students?.length ?? 0;

const getEnrollmentCount = (parent: any) => {
  if (typeof parent?.enrollmentCount === 'number') {
    return parent.enrollmentCount;
  }

  const students = parent?.students || [];
  return students.reduce(
    (total: number, student: any) => total + (student?.enrollments?.length ?? 0),
    0,
  );
};

const getRegistrationState = (parent: any) => {
  const studentCount = getStudentCount(parent);
  const enrollmentCount = getEnrollmentCount(parent);
  const hasLinkedStudents = studentCount > 0;
  const hasEnrollments = enrollmentCount > 0;

  if (!hasLinkedStudents) {
    return {
      label: 'Chưa liên kết học sinh',
      variant: 'secondary' as const,
      description: 'Cần hướng dẫn thêm thông tin con',
    };
  }

  if (!hasEnrollments) {
    return {
      label: 'Chưa đăng ký khóa học',
      variant: 'destructive' as const,
      description: 'Đã có thông tin con, chưa chọn lớp',
    };
  }

  return {
    label: 'Đã đăng ký',
    variant: 'default' as const,
    description: 'Đã tham gia ít nhất một lớp',
  };
};

export const CustomerManagementPage = () => {
  const navigate = useNavigate();
  const pagination = usePagination({
    initialPage: 1,
    initialItemsPerPage: 10,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
      pagination.setCurrentPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm, pagination]);

  const {
    data: parentResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery<ParentListResponse>({
    queryKey: [
      'unregistered-parents',
      {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm,
      },
    ],
    queryFn: () =>
      ParentService.getListParents({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: debouncedSearchTerm || undefined,
        hasEnrollments: false,
      }),
    staleTime: 5000,
    refetchOnWindowFocus: false,
  });

  const parentsRaw = parentResponse?.data ?? [];

  const unregisteredParents = useMemo(() => {
    return parentsRaw.filter((parent: any) => {
      const enrollmentCount = getEnrollmentCount(parent);
      return enrollmentCount === 0;
    });
  }, [parentsRaw]);

  const totalItems = parentResponse?.pagination?.total ?? unregisteredParents.length;

  useEffect(() => {
    pagination.setTotalItems(totalItems);
  }, [pagination, totalItems]);

  const stats = useMemo(() => {
    const withoutStudents = unregisteredParents.filter(
      (parent: any) => getStudentCount(parent) === 0,
    ).length;
    const activeAccounts = unregisteredParents.filter((parent: any) => parent?.user?.isActive).length;

    return {
      totalLeads: totalItems,
      withoutStudents,
      activeAccounts,
    };
  }, [totalItems, unregisteredParents]);

  const columns: Column<any>[] = [
    {
      key: 'index',
      header: 'STT',
      width: '70px',
      render: (_parent, index) =>
        (pagination.currentPage - 1) * pagination.itemsPerPage + index + 1,
    },
    {
      key: 'account',
      header: 'Phụ huynh',
      width: '260px',
      render: (parent: any) => (
        <div className="space-y-1">
          <button
            className="text-sm font-semibold text-blue-600 hover:underline"
            onClick={() => navigate(`/center-qn/parents/${parent?.id}`)}
          >
            {parent?.user?.fullName || 'Chưa cập nhật'}
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="w-3 h-3" />
            {parent?.user?.email || 'Không có email'}
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Liên hệ',
      width: '220px',
      render: (parent: any) => (
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3" />
            {parent?.user?.phone || 'Chưa cập nhật'}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3" />
            {parent?.createdAt
              ? new Date(parent.createdAt).toLocaleDateString('vi-VN')
              : 'Chưa xác định'}
          </div>
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Thông tin học sinh',
      width: '260px',
      render: (parent: any) => {
        if (parent?.students?.length > 0) {
          return (
            <div className="space-y-1 text-sm text-gray-700 dark:text-gray-200">
              {parent.students.map((student: any) => (
                <div key={student?.id} className="flex items-center justify-between gap-2">
                  <span>{student?.user?.fullName || 'Chưa rõ'}</span>
                  <span className="text-xs text-gray-500">
                    {(student?.enrollments?.length ?? 0)} khóa
                  </span>
                </div>
              ))}
            </div>
          );
        }

        return <span className="text-xs text-gray-400">Chưa có học sinh</span>;
      },
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '220px',
      render: (parent: any) => {
        const registrationState = getRegistrationState(parent);
        return (
          <div className="space-y-2">
            <Badge variant={parent?.user?.isActive ? 'default' : 'secondary'}>
              {parent?.user?.isActive ? 'Tài khoản hoạt động' : 'Tài khoản bị khóa'}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3 text-yellow-500" />
              <span>{registrationState.description}</span>
            </div>
            <Badge variant={registrationState.variant}>{registrationState.label}</Badge>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'center',
      width: '140px',
      render: (parent: any) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/center-qn/parents/${parent?.id}`)}
          >
            Xem chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Quản lý khách hàng</h1>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    onClick={() => navigate('/center-qn')}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Khách hàng chưa đăng ký</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tổng phụ huynh chưa đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-semibold">{stats.totalLeads}</p>
              <p className="text-xs text-gray-500">Cần chăm sóc</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Chưa thêm thông tin học sinh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.withoutStudents}</p>
            <p className="text-xs text-gray-500">Ưu tiên hướng dẫn bổ sung hồ sơ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Tài khoản đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.activeAccounts}</p>
            <p className="text-xs text-gray-500">Sẵn sàng liên hệ ngay</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Tìm theo tên, email, số điện thoại"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
        <DataTable
          data={unregisteredParents}
          columns={columns}
          loading={isLoading}
          error={isError ? 'Không thể tải danh sách khách hàng' : null}
          onRetry={refetch}
          emptyMessage="Chưa có phụ huynh nào cần chăm sóc"
          pagination={{
            currentPage: pagination.currentPage,
            totalPages: parentResponse?.pagination?.totalPages ?? pagination.totalPages,
            totalItems,
            itemsPerPage: pagination.itemsPerPage,
            onPageChange: pagination.setCurrentPage,
            onItemsPerPageChange: pagination.setItemsPerPage,
            showItemsPerPage: true,
            showPageInfo: true,
          }}
          rowKey="id"
          hoverable
        />
      </div>
    </div>
  );
};

export default CustomerManagementPage;

