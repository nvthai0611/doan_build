import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, Edit2, Save, X, CheckSquare } from 'lucide-react';
import { DataTable, Column } from '../../../../components/common/Table/DataTable';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { centerOwnerScheduleService } from '@/services/center-owner/center-schedule/schedule.service';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: string;
  attendanceTime?: string;
  note?: string;
}

interface StudentsTabProps {
  students: Student[];
  sessionId: string;
}

export const StudentsTab = ({ students, sessionId }: any) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const queryClient = useQueryClient();

  const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    present: { 
      label: 'Có mặt',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    absent: { 
      label: 'Vắng mặt',
      icon: XCircle,
      color: 'text-red-600'
    },
    late: { 
      label: 'Đi muộn',
      icon: Clock,
      color: 'text-orange-600'
    },
    excused: { 
      label: 'Có phép',
      icon: CheckCircle,
      color: 'text-blue-600'
    },
  };

  const statusCounts = students.reduce((acc: any, student: any) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {});

  const filteredStudents = statusFilter === 'all' 
    ? students 
    : students.filter((s: any) => s.status === statusFilter);

  // Mutation để cập nhật điểm danh đơn lẻ
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status, note }: { studentId: string; status: string; note?: string }) => {
      return await centerOwnerScheduleService.updateStudentAttendance(
        sessionId,
        studentId,
        status,
        note
      );
    },
    onSuccess: () => {
      toast.success('Cập nhật điểm danh thành công');
      queryClient.invalidateQueries({ queryKey: ['sessionAttendance', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId] });
      setEditingStudentId(null);
      setEditStatus('');
      setEditNote('');
      
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật điểm danh');
    }
  });

  // Mutation để cập nhật điểm danh hàng loạt
  const updateBulkAttendanceMutation = useMutation({
    mutationFn: async ({ attendances }: { attendances: Array<{ studentId: string; status: string; note?: string }> }) => {
      return await centerOwnerScheduleService.updateBulkAttendanceManagement(sessionId, attendances);
    },
    onSuccess: () => {
      toast.success(`Đã cập nhật điểm danh cho ${selectedStudents.length} học sinh`);
      queryClient.invalidateQueries({ queryKey: ['sessionAttendance', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessionDetail', sessionId] });
      setSelectedStudents([]);
      setBulkStatus('');     
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật điểm danh');
    }
  });

  // Xử lý chọn/bỏ chọn tất cả
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(filteredStudents.map((s: any) => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Xử lý chọn/bỏ chọn từng học sinh
  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    }
  };

  // Xử lý điểm danh hàng loạt
  const handleBulkAttendance = () => {
    if (!bulkStatus) {
      toast.error('Vui lòng chọn trạng thái điểm danh');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('Vui lòng chọn ít nhất một học sinh');
      return;
    }
    
    const attendances = selectedStudents.map(studentId => ({
      studentId,
      status: bulkStatus,
      note: undefined
    }));

    updateBulkAttendanceMutation.mutate({ attendances });
  };

  // Các hàm xử lý edit đơn lẻ
  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setEditStatus(student.status);
    setEditNote(student.note || '');
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditStatus('');
    setEditNote('');
  };

  const handleSaveEdit = (studentId: string) => {
    if (!editStatus) {
      toast.error('Vui lòng chọn trạng thái điểm danh');
      return;
    }
    
    updateAttendanceMutation.mutate({
      studentId,
      status: editStatus,
      note: editNote
    });
  };

  // Check xem tất cả có được chọn không
  const isAllSelected = filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length;

  const columns: Column<Student>[] = [
    {
      key: 'checkbox',
      header: () => (
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAll}
          aria-label="Chọn tất cả"
          className="mx-auto"
        />
      ),
      width: '50px',
      align: 'center',
      render: (student: Student) => (
        <Checkbox
          checked={selectedStudents.includes(student.id)}
          onCheckedChange={(checked: any) => handleSelectStudent(student.id, checked)}
          aria-label={`Chọn ${student.name}`}
        />
      )
    },
    {
      key: 'name',
      header: 'Học viên',
      width: '200px',
      render: (student: Student) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={student.avatar} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {student.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-blue-600 cursor-pointer hover:underline">
              {student.name}
            </p>
            {student.email && (
              <p className="text-sm text-gray-500">{student.email}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái',
      width: '200px',
      render: (student: Student) => {
        const isEditing = editingStudentId === student.id;
        
        if (isEditing) {
          return (
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );
        }

        const config = statusConfig[student.status];
        if (!config) {
          return <span className="text-sm text-gray-500">Chưa điểm danh</span>;
        }

        const Icon = config.icon;
        
        return (
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${config.color}`} />
            <span className={`font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      }
    },
    {
      key: 'note',
      header: 'Ghi chú',
      width: '250px',
      render: (student: Student) => {
        const isEditing = editingStudentId === student.id;
        
        if (isEditing) {
          return (
            <Input
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full"
            />
          );
        }

        return (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {student.note || '-'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Thao tác',
      width: '150px',
      align: 'center',
      render: (student: Student) => {
        const isEditing = editingStudentId === student.id;
        
        if (isEditing) {
          return (
            <div className="flex items-center justify-center gap-2">
              <Button
                size="sm"
                onClick={() => handleSaveEdit(student.id)}
                disabled={updateAttendanceMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
                disabled={updateAttendanceMutation.isPending}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleStartEdit(student)}
              className="hover:bg-blue-50"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      {/* Top Action Bar - Always visible */}
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Select all button */}
          <div className="flex items-center gap-3">
            <Button
              variant={isAllSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleSelectAll(!isAllSelected)}
              className="flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4" />
              {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Button>
            {selectedStudents.length > 0 && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Đã chọn <span className="font-semibold text-blue-600">{selectedStudents.length}</span> / {filteredStudents.length} học sinh
              </span>
            )}
          </div>

          {/* Right side - Bulk action controls */}
          {selectedStudents.length > 0 && (
            <div className="flex items-center gap-3">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${config.color}`} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Button
                onClick={handleBulkAttendance}
                disabled={updateBulkAttendanceMutation.isPending || !bulkStatus}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                {updateBulkAttendanceMutation.isPending ? 'Đang xử lý...' : 'Điểm danh'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tất cả <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{students.length}</span>
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {config.label} <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{statusCounts[key] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        loading={false}
        emptyMessage="Không có học viên nào"
        rowKey="id"
        hoverable={true}
        enableSearch={true}
        enableSort={false}
      />
    </div>
  );
};

