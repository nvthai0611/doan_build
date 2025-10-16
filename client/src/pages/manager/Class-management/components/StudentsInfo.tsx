import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Search, MoreHorizontal, Mail, Phone, Calendar, ChevronLeft, ChevronRight, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { DataTable, Column, PaginationConfig } from '../../../../components/common/Table/DataTable';

interface StudentsInfoProps {
  classId: string;
  classData?: any;
}

export const StudentsInfo = ({ classId, classData }: StudentsInfoProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Mock data - sẽ được thay thế bằng data thật từ API
  const students = classData?.students || [
    {
      id: '1',
      studentId: 'ST001',
      fullName: 'Nguyễn Văn An',
      email: 'an.nguyen@email.com',
      phone: '0123456789',
      avatar: '',
      enrolledAt: '2024-01-15',
      endDate: '2024-06-15',
      status: 'studying',
      studyStatus: 'Đang học',
      classesAttended: 15,
      classesRegistered: 20,
      componentScore: 85,
      averageScore: 88,
      accountStatus: 'active',
      graduationStatus: 'not_graduated'
    },
    {
      id: '2',
      studentId: 'ST002',
      fullName: 'Trần Thị Bình',
      email: 'binh.tran@email.com',
      phone: '0987654321',
      avatar: '',
      enrolledAt: '2024-01-20',
      endDate: '2024-06-20',
      status: 'upcoming',
      studyStatus: 'Sắp học',
      classesAttended: 0,
      classesRegistered: 20,
      componentScore: 0,
      averageScore: 0,
      accountStatus: 'active',
      graduationStatus: 'not_graduated'
    },
    {
      id: '3',
      studentId: 'ST003',
      fullName: 'Lê Văn Cường',
      email: 'cuong.le@email.com',
      phone: '0369852147',
      avatar: '',
      enrolledAt: '2024-02-01',
      endDate: '2024-07-01',
      status: 'reserved',
      studyStatus: 'Bảo lưu',
      classesAttended: 8,
      classesRegistered: 20,
      componentScore: 75,
      averageScore: 78,
      accountStatus: 'active',
      graduationStatus: 'not_graduated'
    }
  ];

  // Status filters với counts
  const statusFilters = [
    { key: 'all', label: 'Tất cả', count: students.length },
    { key: 'schedule_not_updated', label: 'Chưa cập nhật lịch học', count: 0 },
    { key: 'upcoming', label: 'Sắp học', count: students.filter((s: any) => s.status === 'upcoming').length },
    { key: 'studying', label: 'Đang học', count: students.filter((s: any) => s.status === 'studying').length },
    { key: 'reserved', label: 'Bảo lưu', count: students.filter((s: any) => s.status === 'reserved').length },
    { key: 'stopped', label: 'Dừng học', count: students.filter((s: any) => s.status === 'stopped').length },
    { key: 'graduated', label: 'Tốt nghiệp', count: students.filter((s: any) => s.status === 'graduated').length }
  ];

  // Filter students based on active filter
  const filteredStudents = students.filter((student: any) => {
    if (activeStatusFilter === 'all') return true;
    if (activeStatusFilter === 'schedule_not_updated') return false; // Mock: no students with this status
    return student.status === activeStatusFilter;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
      studying: { variant: 'default', label: 'Đang học', className: 'bg-green-100 text-green-800 border-green-200' },
      upcoming: { variant: 'secondary', label: 'Sắp học', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      reserved: { variant: 'outline', label: 'Bảo lưu', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      stopped: { variant: 'destructive', label: 'Dừng học', className: 'bg-red-100 text-red-800 border-red-200' },
      graduated: { variant: 'default', label: 'Tốt nghiệp', className: 'bg-purple-100 text-purple-800 border-purple-200' }
    };
    const config = variants[status] || variants.studying;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getAccountStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800">Hoạt động</Badge> :
      <Badge variant="destructive">Không hoạt động</Badge>;
  };

  const getGraduationStatusBadge = (status: string) => {
    return status === 'graduated' ? 
      <Badge className="bg-purple-100 text-purple-800">Đã tốt nghiệp</Badge> :
      <Badge variant="outline">Chưa tốt nghiệp</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Define columns for DataTable
  const columns: Column<any>[] = [
    {
      key: 'stt',
      header: 'STT',
      width: '60px',
      align: 'center',
      render: (_: any, index: number) => (currentPage - 1) * itemsPerPage + index + 1
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
                        <p className="text-sm text-gray-500">ID: {student.studentId}</p>
                      </div>
                    </div>
      )
    },
    {
      key: 'studyStatus',
      header: 'Trạng thái học tập',
      width: '150px',
      render: (student: any) => getStatusBadge(student.status)
    },
    {
      key: 'classes',
      header: 'Buổi đã học/đăng ký',
      width: '150px',
      align: 'center',
      render: (student: any) => (
        <div className="text-center">
          <p className="font-medium">{student.classesAttended}/{student.classesRegistered}</p>
                      </div>
      )
    },
    {
      key: 'startDate',
      header: 'Ngày bắt đầu học',
      width: '120px',
      render: (student: any) => format(new Date(student.enrolledAt), 'dd/MM/yyyy')
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
      )
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
      )
    },
    {
      key: 'accountStatus',
      header: 'Trạng thái tài khoản',
      width: '150px',
      render: (student: any) => getAccountStatusBadge(student.accountStatus)
    },
    {
      key: 'graduationStatus',
      header: 'Trạng thái tốt nghiệp',
      width: '150px',
      render: (student: any) => getGraduationStatusBadge(student.graduationStatus)
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
                        <DropdownMenuItem className="text-red-600">Xóa khỏi lớp</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Danh sách tài khoản học viên</h1>
          </div>
          <div className="flex gap-3">
            <Button>
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
                <label className="text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu học</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Ngày kết thúc học</label>
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
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:text-white"
                }`}
              >
                {filter.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={filteredStudents}
          columns={columns}
          pagination={undefined} // Disable default pagination
          emptyMessage="Không có dữ liệu"
          className="shadow-sm"
        />
        
        {/* Custom Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={isCollapsed}
                onCheckedChange={setIsCollapsed}
                className="data-[state=checked]:bg-purple-600"
              />
              <span className="text-sm text-gray-600">Thu gọn</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Số hàng mỗi trang:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredStudents.length === 0 ? '0-0 trong 0' : 
                `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredStudents.length)} trong ${filteredStudents.length}`}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={currentPage >= Math.ceil(filteredStudents.length / itemsPerPage)}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};