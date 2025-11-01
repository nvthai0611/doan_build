import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle } from 'lucide-react';
import { DataTable, Column } from '../../../../components/common/Table/DataTable';
import { AttendanceStatus, ATTENDANCE_STATUS_LABELS, getStatusLabel } from '../../../../lib/constants';

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'present' | 'absent' | 'excused';
  attendanceTime?: string;
}

interface StudentsTabProps {
  students: Student[];
}

export const StudentsTab = ({ students }: StudentsTabProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Status mapping từ constants - CHỈ CÓ 3 TRẠNG THÁI
  const statusConfig: Record<string, { label: string }> = {
    [AttendanceStatus.PRESENT]: { label: getStatusLabel(AttendanceStatus.PRESENT, ATTENDANCE_STATUS_LABELS) },
    [AttendanceStatus.ABSENT]: { label: getStatusLabel(AttendanceStatus.ABSENT, ATTENDANCE_STATUS_LABELS) },
    [AttendanceStatus.EXCUSED]: { label: getStatusLabel(AttendanceStatus.EXCUSED, ATTENDANCE_STATUS_LABELS) },
  };

  // Calculate counts
  const statusCounts = students.reduce((acc: any, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {});

  // Filter students by status
  const filteredStudents = statusFilter === 'all' 
    ? students 
    : students.filter(s => s.status === statusFilter);

  // Định nghĩa columns cho DataTable
  const columns: Column<Student>[] = [
    {
      key: 'name',
      header: 'Học viên',
      width: '150px',
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
      key: 'present',
      header: 'Có mặt',
      align: 'center',
      width: '100px',
      render: (student: Student) => (
        <div className="flex justify-center">
          {student.status === AttendanceStatus.PRESENT && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
      )
    },
    {
      key: 'absent',
      header: 'Vắng mặt',
      align: 'center',
      width: '100px',
      render: (student: Student) => (
        <div className="flex justify-center">
          {student.status === AttendanceStatus.ABSENT && (
            <XCircle className="w-5 h-5 text-red-600" />
          )}
        </div>
      )
    },
    {
      key: 'excused',
      header: 'Có phép',
      align: 'center',
      width: '100px',
      render: (student: Student) => (
        <div className="flex justify-center">
          {student.status === AttendanceStatus.EXCUSED && (
            <CheckCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>
      )
    },
  
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
      {/* Tabs - Status filters */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
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

