import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Student } from '../../../types/student';
import {
  DataTable,
  Column,
} from '../../../../../../components/common/Table/DataTable';
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_COLORS,
} from '../../../../../../lib/constants';

interface StudentScheduleTabProps {
  student: Student;
}

const STATUS_ORDER = [
  'studying',
  'not_been_updated',
  'graduated',
  'withdrawn',
  'stopped',
];

// Map tiếng Anh sang tiếng Việt cho các ngày trong tuần
const DAY_MAP: Record<string, string> = {
  monday: 'Thứ 2',
  tuesday: 'Thứ 3',
  wednesday: 'Thứ 4',
  thursday: 'Thứ 5',
  friday: 'Thứ 6',
  saturday: 'Thứ 7',
  sunday: 'Chủ nhật',
};

export const StudentScheduleTab: React.FC<StudentScheduleTabProps> = ({
  student,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Hàm format lịch học
  const formatSchedule = (schedules: any[]): string[] => {
    if (!schedules || schedules.length === 0) return [];
    return schedules.map(
      (s: any) => `${DAY_MAP[s.day] || s.day}, ${s.startTime}-${s.endTime}`,
    );
  };

  if (!student.enrollments || student.enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            Học viên chưa đăng ký lớp học nào
          </p>
        </CardContent>
      </Card>
    );
  }

  // Chuẩn hóa data cho DataTable
  const data = useMemo(() => {
    // Sắp xếp theo thứ tự status yêu cầu
    const sorted = [...student.enrollments].sort((a: any, b: any) => {
      const aIdx = STATUS_ORDER.indexOf(a.status);
      const bIdx = STATUS_ORDER.indexOf(b.status);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
    return sorted.map((enrollment: any) => ({
      id: enrollment.id,
      subjectName: enrollment.class.subject.name,
      className: enrollment.class.name,
      subjectCode: enrollment.class.subject.code,
      teacherName: enrollment.class.teacher?.user.fullName || 'Chưa phân công',
      teacherEmail: enrollment.class.teacher?.user.email || '-',
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      finalGrade: enrollment.finalGrade,
      schedule: formatSchedule(enrollment.class.recurringSchedule?.schedules),
    }));
  }, [student.enrollments]);

  // Paging
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  // Định nghĩa columns cho DataTable
  const columns: Column<any>[] = [
    {
      key: 'subjectName',
      header: 'Môn học',
      render: (item) => <span className="font-medium">{item.subjectName}</span>,
    },
    {
      key: 'className',
      header: 'Lớp',
    },
    {
      key: 'subjectCode',
      header: 'Mã môn học',
    },
    {
      key: 'teacherName',
      header: 'Giáo viên',
    },
    {
      key: 'teacherEmail',
      header: 'Email giáo viên',
    },
    {
      key: 'schedule',
      header: 'Lịch học',
      render: (item) => (
        <div className="flex flex-col gap-1">
          {Array.isArray(item.schedule) ? (
            item.schedule.length > 0 ? (
              item.schedule.map((line: string, idx: number) => (
                <div key={idx}>{line}</div>
              ))
            ) : (
              <span>-</span>
            )
          ) : // Nếu vẫn là chuỗi cũ, fallback
          item.schedule && typeof item.schedule === 'string' ? (
            item.schedule
              .split('; ')
              .map((line: string, idx: number) => <div key={idx}>{line}</div>)
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái đăng ký',
      render: (item) => (
        <Badge className={ENROLLMENT_STATUS_COLORS[item.status] || ''}>
          {ENROLLMENT_STATUS_LABELS[item.status] || item.status}
        </Badge>
      ),
    },
    {
      key: 'enrolledAt',
      header: 'Ngày đăng ký',
      render: (item) => formatDate(item.enrolledAt),
    },
    {
      key: 'finalGrade',
      header: 'Điểm tổng kết',
      render: (item) =>
        item.finalGrade !== undefined && item.finalGrade !== null ? (
          <span className="font-bold">{item.finalGrade}</span>
        ) : (
          <span className="text-gray-400 italic">-</span>
        ),
    },
  ];

  // Pagination config cho DataTable
  const paginationConfig = {
    currentPage,
    totalPages: Math.ceil(data.length / itemsPerPage),
    totalItems: data.length,
    itemsPerPage,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true,
  };

  return (
    <DataTable
      data={pagedData}
      columns={columns}
      emptyMessage="Học viên chưa đăng ký lớp học nào"
      className="mt-2"
      enableSearch={false}
      enableSort={false}
      rowKey="id"
      striped
      pagination={paginationConfig}
    />
  );
};
