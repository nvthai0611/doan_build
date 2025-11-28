import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Calculator, X } from 'lucide-react';

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
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // State for selected status
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]); // State for selected enrollments

  // --- attendance UI state ---
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [showAttendanceCard, setShowAttendanceCard] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [attendanceCalculationData, setAttendanceCalculationData] = useState<any>(null);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
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

  // Fetch attendance-based fee calculation
  const handleCalculateAttendanceFees = async () => {
    if (selectedEnrollmentIds.length === 0) return;

    setLoadingCalculation(true);
    try {
      const classIds = selectedEnrollmentsSummary.map(item => 
        student.enrollments.find(e => e.id === item.id)?.class.id
      ).filter(Boolean);

      const response = await centerOwnerStudentService.getStudentAttendanceForFeeCalculation(
        student.id,
        classIds
      );

      setAttendanceCalculationData(response.data);
      setShowCalculationModal(true);
    } catch (error) {
      console.error('Error calculating attendance fees:', error);
      toast.error('Không thể tính toán chi phí dựa trên số buổi đã học');
    } finally {
      setLoadingCalculation(false);
    }
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

  const filterDataByStatusOrder = (enrollments: any[]) => {
    if (!selectedStatus) return enrollments; // No filter applied
    return enrollments.filter(enrollment => enrollment.status === selectedStatus);
  };

  // Chuẩn hóa data cho DataTable
  const data = useMemo(() => {
    // Filter and sort by status order
    const filtered = filterDataByStatusOrder(student.enrollments);
    const sorted = [...filtered].sort((a: any, b: any) => {
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
      feeAmount: enrollment.class.feeAmount || 0, // Thêm giá tiền
    }));
  }, [student.enrollments, selectedStatus]); // Add selectedStatus to dependencies

  // Data for calculation summary (independent of table filter)
  const selectedEnrollmentsSummary = useMemo(() => {
    return student.enrollments
      .filter((e: any) => selectedEnrollmentIds.includes(e.id))
      .map((e: any) => ({
        id: e.id,
        className: e.class.name,
        subjectName: e.class.subject.name,
        feeAmount: e.class.feeAmount || 0,
      }));
  }, [student.enrollments, selectedEnrollmentIds]);

  const scholarshipPercent = student.scholarship?.percent || 0;

  // Paging
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  // Định nghĩa columns cho DataTable
  const columns: Column<any>[] = [
    {
      key: 'select',
      header: 'Chọn',
      render: (item) => (
        <Checkbox
          checked={selectedEnrollmentIds.includes(item.id)}
          onCheckedChange={(checked) => {
            setSelectedEnrollmentIds((prev) =>
              checked
                ? [...prev, item.id]
                : prev.filter((id) => id !== item.id)
            );
          }}
        />
      ),
    },
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
  
  // Filter UI
  const renderFilterButtons = () => (
    <div className="flex space-x-2 mb-4">
      <Button onClick={() => setSelectedStatus(null)} variant={selectedStatus === null ? 'solid' : 'outline'}>
        Tất cả
      </Button>
      {STATUS_ORDER.map(status => (
        <Button
          key={status}
          onClick={() => setSelectedStatus(status)}
          variant={selectedStatus === status ? 'solid' : 'outline'}
        >
          {ENROLLMENT_STATUS_LABELS[status]}
        </Button>
      ))}
      
    </div>
  );

  // Updated Fee Calculation Modal Component
  const FeeCalculationModal = () => (
    <Dialog open={showCalculationModal} onOpenChange={setShowCalculationModal}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5" />
            Tính toán chi phí theo số buổi đã học
            {attendanceCalculationData && (
              <span className="text-sm text-muted-foreground">
                ({attendanceCalculationData.periodDisplay} - Học bổng: {attendanceCalculationData.scholarshipPercent}%)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {attendanceCalculationData ? (
          <div className="space-y-6">
            {/* Thông tin tổng quan */}
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-semibold text-lg mb-3">Thông tin chung</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Học viên:</span>
                  <div className="font-medium">{attendanceCalculationData.studentName}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Học bổng:</span>
                  <div className="font-medium">{attendanceCalculationData.scholarshipPercent}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Kỳ tính phí:</span>
                  <div className="font-medium">{attendanceCalculationData.periodDisplay}</div>
                </div>
              </div>
            </div>

            {/* Chi tiết từng lớp */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Chi tiết theo từng lớp học</h3>
              {attendanceCalculationData.classAttendances.map((classData: any) => (
                <div
                  key={classData.classId}
                  className="p-4 bg-secondary/20 rounded-lg border"
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{classData.className}</div>
                      <div className="text-muted-foreground">({classData.subjectName})</div>
                      <div className="mt-2 text-sm">
                        <div>Số buổi đã học: <span className="font-medium">{classData.attendedSessions}/{classData.totalSessions}</span></div>
                        <div>Tỷ lệ chuyên cần: <span className="font-medium">{classData.attendanceRate.toFixed(1)}%</span></div>
                      </div>
                    </div>
                    
                    <div className="min-w-[300px]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Giá/buổi:</span>
                          <span className="font-medium">{formatCurrency(classData.feePerSession)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Số buổi đã học:</span>
                          <span className="font-medium">{classData.attendedSessions} buổi</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground">Tạm tính:</span>
                          <span className="font-medium">{formatCurrency(classData.totalFeeBeforeDiscount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-1 text-green-600">
                          <span>Giảm ({classData.scholarshipPercent}%):</span>
                          <span className="font-medium">- {formatCurrency(classData.discountAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-bold text-primary border-t pt-2">
                          <span>Thành tiền:</span>
                          <span className="text-lg">{formatCurrency(classData.finalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tổng kết */}
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="text-right bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
                  <div className="space-y-2 text-sm text-muted-foreground mb-3">
                    <div>Tổng số lớp: {attendanceCalculationData.summary.totalClassesTracked}</div>
                    <div>Tổng buổi đã học: {attendanceCalculationData.summary.totalSessionsAttended}</div>
                    <div>Tổng trước giảm: {formatCurrency(attendanceCalculationData.summary.totalFeeBeforeDiscount)}</div>
                    <div>Tổng giảm giá: {formatCurrency(attendanceCalculationData.summary.totalDiscountAmount)}</div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Tổng cần thanh toán:
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(attendanceCalculationData.summary.totalFinalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedEnrollmentsSummary.map((item) => {
              const originalFee = item.feeAmount;
              const discountAmount = (originalFee * scholarshipPercent) / 100;
              const finalAmount = originalFee - discountAmount;

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-secondary/20 rounded-lg border gap-3"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{item.className}</div>
                    <div className="text-muted-foreground">({item.subjectName})</div>
                  </div>
                  <div className="w-full sm:w-auto min-w-[280px]">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-muted-foreground">Giá gốc:</span>
                        <span className="font-medium">{formatCurrency(originalFee)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 text-green-600">
                        <span>Giảm ({scholarshipPercent}%):</span>
                        <span className="font-medium">- {formatCurrency(discountAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 font-bold text-primary border-t pt-2">
                        <span>Sau giảm:</span>
                        <span className="text-lg">{formatCurrency(finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="border-t pt-4 mt-6">
              <div className="flex justify-end">
                <div className="text-right bg-primary/5 p-4 rounded-lg border-2 border-primary/20">
                  <div className="text-sm text-muted-foreground mb-2">
                    Tổng cộng (Sau khi trừ học bổng):
                  </div>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(
                      selectedEnrollmentsSummary.reduce((acc, item) => {
                        const fee = item.feeAmount;
                        return acc + (fee - (fee * scholarshipPercent) / 100);
                      }, 0)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            setShowCalculationModal(false);
            setAttendanceCalculationData(null);
          }}>
            Đóng
          </Button>
          {!attendanceCalculationData && (
            <Button 
              onClick={handleCalculateAttendanceFees}
              loading={loadingCalculation}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Tính theo buổi đã học
            </Button>
          )}
          <Button onClick={() => window.print()}>
            In báo cáo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {renderFilterButtons()}

      {/* Show calculation button when items are selected */}
      {selectedEnrollmentsSummary.length > 0 && (
        <div className="mb-4 flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="text-sm font-medium">
              Đã chọn {selectedEnrollmentsSummary.length} lớp học để tính toán chi phí
            </span>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowCalculationModal(true)}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Tính theo giá gốc
            </Button>
            <Button 
              size="sm" 
              onClick={handleCalculateAttendanceFees}
              loading={loadingCalculation}
              className="flex items-center gap-2"
            >
              <Calculator className="h-4 w-4" />
              Tính theo buổi đã học
            </Button>
          </div>
        </div>
      )}

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

      {/* Fee Calculation Modal */}
      <FeeCalculationModal />

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
