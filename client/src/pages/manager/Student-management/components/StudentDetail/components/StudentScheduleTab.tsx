import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Student } from '../../../types/student';
import {
  DataTable,
  Column,
} from '../../../../../../components/common/Table/DataTable';
import {
  ENROLLMENT_STATUS_LABELS,
  ENROLLMENT_STATUS_COLORS,
} from '../../../../../../lib/constants';
import { centerOwnerStudentService } from '../../../../../../services/center-owner/student-management/student.service';
import { toast } from 'sonner';

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

  // --- attendance UI state ---
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [showAttendanceCard, setShowAttendanceCard] = useState(false);

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

  // Fetch attendance for a specific class (enrollment)
  const handleViewAttendance = async (classId: string, enrollmentId: string) => {
    try {
      setLoadingAttendance(true);
      setSelectedAttendance(null);
      setSelectedEnrollmentId(enrollmentId);
      const res = await centerOwnerStudentService.getStudentAttendanceByClass(student.id, classId);
      // service trả về trực tiếp counts: { studentId, classId, presentCount, absentCount, excusedCount }
      setSelectedAttendance(res);
      setShowAttendanceCard(true);
    } catch (error) {
      console.error('Lỗi khi lấy attendance:', error);
      toast.error('Lấy dữ liệu điểm danh thất bại');
    } finally {
      setLoadingAttendance(false);
    }
  };
  
  // Placeholder create invoice action — gọi API tạo hóa đơn ở đây khi có endpoint
  const handleCreateInvoice = async () => {
    if (!selectedAttendance) {
      alert('Vui lòng chọn lớp để tạo hóa đơn trước');
      return;
    }

    // Example payload you can adapt
    const invoicePayload = {
      studentId: selectedAttendance.studentId,
      classId: selectedAttendance.classId,
      attendedCount: selectedAttendance.attendedCount,
      excusedCount: selectedAttendance.excusedCount,
      totalClassSessions: selectedAttendance.totalClassSessions,
      // pricePerSession: valueFromUI,
    };

    // TODO: gọi API tạo hóa đơn thật ở đây
    console.log('Tạo hóa đơn với payload:', invoicePayload);
    alert('Yêu cầu tạo hóa đơn đã gửi (demo).');
    // hide details nếu muốn
    setShowAttendanceCard(false);
    setSelectedAttendance(null);
    setSelectedEnrollmentId(null);
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
      classId: enrollment.class.id, // thêm để thao tác
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
    // {
    //   key: 'finalGrade',
    //   header: 'Điểm tổng kết',
    //   render: (item) =>
    //     item.finalGrade !== undefined && item.finalGrade !== null ? (
    //       <span className="font-bold">{item.finalGrade}</span>
    //     ) : (
    //       <span className="text-gray-400 italic">-</span>
    //     ),
    // },
    // Action column
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => handleViewAttendance(item.classId, item.id)}
            loading={loadingAttendance && selectedEnrollmentId === item.id}
          >
            Xem điểm danh
          </Button>
          {/* <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // nếu đã có thông tin hiện tại cho lớp này, mở trực tiếp
              if (selectedAttendance && selectedAttendance.classId === item.classId) {
                setShowAttendanceCard(true);
                setSelectedEnrollmentId(item.id);
              } else {
                handleViewAttendance(item.classId, item.id);
              }
            }}
          >
            Tạo hóa đơn
          </Button> */}
        </div>
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
    <>
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

      {/* Attendance detail / invoice actions */}
      {showAttendanceCard && selectedAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { setShowAttendanceCard(false); setSelectedAttendance(null); }}
          />
          <div role="dialog" aria-modal="true" className="relative z-10 w-full max-w-2xl mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <div>
                  <div className="text-sm text-muted-foreground">Điểm danh - Lớp: {selectedAttendance.className}</div>
                  <div className="text-lg font-medium">Học viên: {selectedAttendance.studentName}</div>
                  <div className="text-lg font-medium">Đây là lịch học trong tháng</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setShowAttendanceCard(false); setSelectedAttendance(null); }}>
                    Đóng
                  </Button>
                  <Button size="sm" onClick={handleCreateInvoice}>
                    Tạo hóa đơn
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Số buổi present</div>
                    <div className="font-bold">{selectedAttendance.presentCount ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Số buổi absent</div>
                    <div className="font-bold">{selectedAttendance.absentCount ?? 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Số buổi excused</div>
                    <div className="font-bold">{selectedAttendance.excusedCount ?? 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
