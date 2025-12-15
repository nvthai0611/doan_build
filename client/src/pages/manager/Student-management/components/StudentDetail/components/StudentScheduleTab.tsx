import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { Calculator, X, CheckSquare, Square, Receipt, CreditCard, Banknote } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/assets/shadcn-ui/components/ui/alert';

interface StudentScheduleTabProps {
  student: Student;
}

// Tách BillingModal thành component riêng để tránh re-render
interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceCalculationData: any;
  selectedEnrollmentsSummary: any[];
  onCreateBilling: (paymentDetails?: any) => void;
  loadingBilling: boolean;
  setShowCalculationModal: (show: boolean) => void;
}

const BillingModal: React.FC<BillingModalProps> = React.memo(({
  open,
  onOpenChange,
  attendanceCalculationData,
  selectedEnrollmentsSummary,
  onCreateBilling,
  loadingBilling,
  setShowCalculationModal
}) => {
  const [billingType, setBillingType] = useState<'invoice-only' | 'pay-now'>('invoice-only');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer'>('cash');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const formatCurrency = useCallback((amount: number) => {
    if (amount === null || amount === undefined || isNaN(amount)) return '0 đ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' vnđ';
  }, []);

  // Format number with thousands separator for input display
  const formatNumberInput = useCallback((value: string) => {
    if (!value) return '';
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    // Format with thousands separator
    return new Intl.NumberFormat('vi-VN').format(parseInt(numbers) || 0);
  }, []);

  // Get raw number value from formatted input
  const getRawValue = useCallback((formattedValue: string) => {
    return formattedValue.replace(/\D/g, '');
  }, []);

  // Reset payment amount when switching billing type
  useEffect(() => {
    if (billingType === 'invoice-only') {
      setPaymentAmount('');
      setPaymentNotes('');
    }
  }, [billingType]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setBillingType('invoice-only');
      setPaymentMethod('cash');
      setPaymentAmount('');
      setPaymentNotes('');
    }
  }, [open]);

  const handleCreateBilling = useCallback(() => {
    let paymentDetails;
    if (billingType === 'pay-now') {
      // Get raw number value for API
      const rawAmount = getRawValue(paymentAmount);
      const amount = parseFloat(rawAmount);
      paymentDetails = {
        payNow: true,
        paymentMethod,
        amount,
        notes: paymentNotes || `Thanh toán ${paymentMethod === 'cash' ? 'tiền mặt' : 'chuyển khoản'} tại quầy`
      };
    }
    onCreateBilling(paymentDetails);
    setShowCalculationModal(false);
  }, [billingType, paymentAmount, paymentMethod, paymentNotes, onCreateBilling, getRawValue]);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digit characters and format
    const formatted = formatNumberInput(value);
    setPaymentAmount(formatted);
  }, [formatNumberInput]);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPaymentNotes(e.target.value);
  }, []);

  const setQuickAmount = useCallback((amount: string) => {
    const formatted = formatNumberInput(amount);
    setPaymentAmount(formatted);
  }, [formatNumberInput]);

  // Get current amount as number for comparisons
  const getCurrentAmount = useCallback(() => {
    const rawValue = getRawValue(paymentAmount);
    return parseFloat(rawValue) || 0;
  }, [paymentAmount, getRawValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-auto max-h-[100vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Tạo hóa đơn thanh toán
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Billing type selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Loại hóa đơn</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={billingType === 'invoice-only' ? 'default' : 'outline'}
                onClick={() => setBillingType('invoice-only')}
                className="h-auto p-4 flex flex-col gap-2"
                disabled={loadingBilling}
              >
                <Receipt className="h-6 w-6" />
                <div className="text-sm font-medium">Chỉ tạo hóa đơn</div>
                <div className="text-xs text-muted-foreground">
                  Phụ huynh thanh toán online sau
                </div>
              </Button>
              
              <Button
                variant={billingType === 'pay-now' ? 'default' : 'outline'}
                onClick={() => setBillingType('pay-now')}
                className="h-auto p-4 flex flex-col gap-2"
                disabled={loadingBilling}
              >
                <CreditCard className="h-6 w-6" />
                <div className="text-sm font-medium">Thanh toán ngay</div>
                <div className="text-xs text-muted-foreground">
                  Thanh toán tại quầy
                </div>
              </Button>
            </div>
          </div>

          {/* Payment details for pay-now option */}
          {billingType === 'pay-now' && (
            <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border">
              <h3 className="font-medium text-base">Thông tin thanh toán</h3>
              
              {/* Payment method */}
              <div className="space-y-2">
                <Label htmlFor="payment-method">Phương thức thanh toán</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={setPaymentMethod}
                  disabled={loadingBilling}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Tiền mặt
                      </div>
                    </SelectItem>
                    {/* <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Chuyển khoản
                      </div>
                    </SelectItem> */}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment amount with quick buttons */}
              <div className="space-y-3">
                <Label htmlFor="payment-amount">
                  Số tiền khách đưa
                  {attendanceCalculationData && (
                    <span className="text-sm text-muted-foreground ml-2">
                      (Tổng học phí: <span className="font-medium text-primary">{formatCurrency(attendanceCalculationData.summary.totalFinalAmount)}</span>)
                    </span>
                  )}
                </Label>
                
                {/* Quick payment buttons */}
                {attendanceCalculationData && (
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Thanh toán nhanh:</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setQuickAmount(attendanceCalculationData.summary.totalFinalAmount.toString())}
                        disabled={loadingBilling}
                        className="text-xs"
                      >
                        Vừa đủ: <span className="font-medium ml-1">{formatCurrency(attendanceCalculationData.summary.totalFinalAmount)}</span>
                      </Button>
                      
                      {[100000, 200000, 500000, 1000000].map(amount => {
                        const total = attendanceCalculationData.summary.totalFinalAmount;
                        const roundedAmount = Math.ceil(total / amount) * amount;
                        if (roundedAmount > total && roundedAmount <= total + 1000000) {
                          return (
                            <Button
                              key={amount}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setQuickAmount(roundedAmount.toString())}
                              disabled={loadingBilling}
                              className="text-xs"
                            >
                              <span className="font-medium">{formatCurrency(roundedAmount)}</span>
                            </Button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    id="payment-amount"
                    type="text"
                    placeholder="Nhập số tiền khách đưa..."
                    value={paymentAmount}
                    onChange={handleAmountChange}
                    disabled={loadingBilling}
                    className={`text-right pr-8 ${
                      attendanceCalculationData && 
                      paymentAmount && 
                      getCurrentAmount() < attendanceCalculationData.summary.totalFinalAmount
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                    đ
                  </span>
                </div>
                
                {/* Payment status display */}
                {attendanceCalculationData && paymentAmount && getCurrentAmount() > 0 && (
                  <div className="space-y-2">
                    {getCurrentAmount() < attendanceCalculationData.summary.totalFinalAmount ? (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                        <X className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Số tiền không đủ</div>
                          <div className="text-xs">
                            Thiếu: <span className="font-medium">{formatCurrency(attendanceCalculationData.summary.totalFinalAmount - getCurrentAmount())}</span>
                          </div>
                        </div>
                      </div>
                    ) : getCurrentAmount() === attendanceCalculationData.summary.totalFinalAmount ? (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                        <CheckSquare className="h-4 w-4" />
                        <div className="font-medium">Vừa đủ tiền</div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-200">
                        <Banknote className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium text-lg">
                            Tiền thừa: <span className="text-blue-700">{formatCurrency(getCurrentAmount() - attendanceCalculationData.summary.totalFinalAmount)}</span>
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            {formatCurrency(getCurrentAmount())} - {formatCurrency(attendanceCalculationData.summary.totalFinalAmount)} = {formatCurrency(getCurrentAmount() - attendanceCalculationData.summary.totalFinalAmount)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment notes */}
              <div className="space-y-2">
                <Label htmlFor="payment-notes">Ghi chú thanh toán (tùy chọn)</Label>
                <Textarea
                  id="payment-notes"
                  placeholder="Nhập ghi chú..."
                  value={paymentNotes}
                  onChange={handleNotesChange}
                  disabled={loadingBilling}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          {attendanceCalculationData && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Tổng số tiền:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(attendanceCalculationData.summary.totalFinalAmount)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {selectedEnrollmentsSummary.length} lớp học • Học bổng: {attendanceCalculationData.scholarshipPercent}%
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loadingBilling}>
            Hủy
          </Button>
          <Button 
            onClick={handleCreateBilling}
            disabled={loadingBilling}
            className="flex items-center gap-2"
          >
            {loadingBilling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {billingType === 'pay-now' ? 'Đang tạo hóa đơn & thanh toán...' : 'Đang tạo hóa đơn...'}
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4" />
                {billingType === 'pay-now' ? 'Tạo hóa đơn & thanh toán' : 'Tạo hóa đơn'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

BillingModal.displayName = 'BillingModal';

const STATUS_ORDER = [
  'studying',
  'not_been_updated',
  'graduated',
  'withdrawn',
  'stopped',
];

// Define active statuses that can be selected for fee calculation
const ACTIVE_STATUSES = ['studying', 'not_been_updated'];

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
  const [selectedStatus, setSelectedStatus] = useState<string | null>('studying');
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState<string[]>([]);

  // --- attendance UI state ---
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<any | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
  const [showAttendanceCard, setShowAttendanceCard] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [attendanceCalculationData, setAttendanceCalculationData] = useState<any>(null);
  const queryClient = useQueryClient()
  // Billing state
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [loadingBilling, setLoadingBilling] = useState(false);

  // Mock current user ID - replace with actual user context
  const currentUserId = 'current-admin-user-id'; // TODO: Get from auth context

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString('vi-VN');
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }, []);

  // Hàm format lịch học
  const formatSchedule = useCallback((schedules: any[]): string[] => {
    if (!schedules || schedules.length === 0) return [];
    return schedules.map(
      (s: any) => `${DAY_MAP[s.day] || s.day}, ${s.startTime}-${s.endTime}`,
    );
  }, []);

  // Get active enrollments (can be selected for calculation)
  const activeEnrollments = useMemo(() => {
    return student.enrollments?.filter((enrollment: any) => 
      ACTIVE_STATUSES.includes(enrollment.status)
    ) || [];
  }, [student.enrollments]);

  // Get currently displayed active enrollments (filtered by current status filter)
  const displayedActiveEnrollments = useMemo(() => {
    if (!selectedStatus) {
      return activeEnrollments;
    }
    return activeEnrollments.filter((enrollment: any) => enrollment.status === selectedStatus);
  }, [activeEnrollments, selectedStatus]);

  // Check if all displayed active enrollments are selected
  const isAllActiveSelected = useMemo(() => {
    if (displayedActiveEnrollments.length === 0) return false;
    return displayedActiveEnrollments.every((enrollment: any) => 
      selectedEnrollmentIds.includes(enrollment.id)
    );
  }, [displayedActiveEnrollments, selectedEnrollmentIds]);

  // Check if some but not all are selected
  const isSomeActiveSelected = useMemo(() => {
    return displayedActiveEnrollments.some((enrollment: any) => 
      selectedEnrollmentIds.includes(enrollment.id)
    ) && !isAllActiveSelected;
  }, [displayedActiveEnrollments, selectedEnrollmentIds, isAllActiveSelected]);

  // Handle select all toggle
  const handleSelectAllActive = useCallback(() => {
    if (isAllActiveSelected) {
      // Deselect all displayed active enrollments
      setSelectedEnrollmentIds(prev => 
        prev.filter(id => 
          !displayedActiveEnrollments.some(enrollment => enrollment.id === id)
        )
      );
    } else {
      // Select all displayed active enrollments
      const activeIds = displayedActiveEnrollments.map(enrollment => enrollment.id);
      setSelectedEnrollmentIds(prev => {
        const newSelected = new Set([...prev, ...activeIds]);
        return Array.from(newSelected);
      });
    }
  }, [isAllActiveSelected, displayedActiveEnrollments]);

  // Handle individual checkbox change
  const handleEnrollmentSelect = useCallback((enrollmentId: string, checked: boolean) => {
    setSelectedEnrollmentIds(prev => 
      checked 
        ? [...prev, enrollmentId]
        : prev.filter(id => id !== enrollmentId)
    );
  }, []);

  // Fetch attendance for a specific class (enrollment)
  const handleViewAttendance = useCallback(async (classId: string, enrollmentId: string) => {
    try {
      setLoadingAttendance(true);
      setSelectedAttendance(null);
      setSelectedEnrollmentId(enrollmentId);
      const res = await centerOwnerStudentService.getStudentAttendanceByClass(student.id, classId);
      setSelectedAttendance(res);
      setShowAttendanceCard(true);
    } catch (error) {
      console.error('Lỗi khi lấy attendance:', error);
      toast.error('Lấy dữ liệu điểm danh thất bại');
    } finally {
      setLoadingAttendance(false);
    }
  }, [student.id]);

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

  // Fetch attendance-based fee calculation
  const handleCalculateAttendanceFees = useCallback(async () => {
    if (selectedEnrollmentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp học đang hoạt động');
      return;
    }

    setLoadingCalculation(true);
    try {
      const classIds = selectedEnrollmentsSummary
        .map(item => {
          const enrollment = student.enrollments.find(e => e.id === item.id);
          return enrollment?.class?.id;
        })
        .filter(Boolean)
        .filter(id => typeof id === 'string' && id.length > 0);

      if (classIds.length === 0) {
        toast.error('Không tìm thấy ID lớp học hợp lệ');
        return;
      }

      const response = await centerOwnerStudentService.getStudentAttendanceForFeeCalculation(
        student.id,
        classIds
      );

      if (response && response.data) {
        setAttendanceCalculationData(response.data);
        setShowCalculationModal(true);
      } else {
        toast.error('Không có dữ liệu trả về từ API');
      }
    } catch (error) {
      console.error('Error calculating attendance fees:', error);
      toast.error('Không thể tính toán chi phí dựa trên số buổi đã học');
    } finally {
      setLoadingCalculation(false);
    }
  }, [selectedEnrollmentIds, selectedEnrollmentsSummary, student.enrollments, student.id]);

  // Improved handle create billing/invoice with better validation and UX
  const handleCreateBilling = useCallback(async (paymentDetails?: any) => {
    if (selectedEnrollmentIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một lớp học');
      return;
    }

    if (!attendanceCalculationData) {
      toast.error('Vui lòng tính toán chi phí trước khi tạo hóa đơn');
      return;
    }

    const totalAmount = attendanceCalculationData.summary.totalFinalAmount;

    // Validate payment details for pay-now option
    if (paymentDetails?.payNow) {
      if (!paymentDetails.amount || paymentDetails.amount <= 0) {
        toast.error('Vui lòng nhập số tiền khách đưa hợp lệ');
        return;
      }

      if (paymentDetails.amount < totalAmount) {
        toast.error(`Số tiền khách đưa không đủ. Cần thêm: ${formatCurrency(totalAmount - paymentDetails.amount)}`);
        return;
      }
    }

    setLoadingBilling(true);

    try {
      const classIds = selectedEnrollmentsSummary
        .map(item => {
          const enrollment = student.enrollments.find(e => e.id === item.id);
          return enrollment?.class?.id;
        })
        .filter(Boolean)
        .filter(id => typeof id === 'string' && id.length > 0);

      const response = await centerOwnerStudentService.createBillingForAttendanceFee(
        student.id,
        {
          classIds,
          paymentDetails
        }
      );
      
      if (response.data) {
        queryClient.invalidateQueries({queryKey: ['studentDetail', student.id]});
        // Show success with change information
        if (paymentDetails?.payNow && response.data.payment) {
          const changeAmount = paymentDetails.amount - totalAmount;
          if (changeAmount > 0) {
            toast.success(
              `Thanh toán thành công! Tiền thừa: ${formatCurrency(changeAmount)}. Mã GD: ${response.data.payment.transactionCode}`,
              { duration: 5000 }
            );
          } else {
            toast.success(
              `Thanh toán thành công (vừa đủ tiền). Mã GD: ${response.data.payment.transactionCode}`
            );
          }
        } else {
          toast.success('Tạo hóa đơn thành công');
        }
        queryClient.invalidateQueries({queryKey: ['studentDetail', student.id]});
        // Reset states
        setShowBillingModal(false);
        setShowCalculationModal(false);
        setSelectedEnrollmentIds([]);
        setAttendanceCalculationData(null);
      
      }
    } catch (error: any) {
      console.error('Error creating billing:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo hóa đơn';
      toast.error(errorMessage);
    } finally {
      setLoadingBilling(false);
    }
  }, [selectedEnrollmentIds, attendanceCalculationData, selectedEnrollmentsSummary, student.enrollments, student.id, currentUserId, formatCurrency]);

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
    if (!selectedStatus) return enrollments;
    return enrollments.filter(enrollment => enrollment.status === selectedStatus);
  };

  // Chuẩn hóa data cho DataTable
  const data = useMemo(() => {
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
      classId: enrollment.class.id,
      feeAmount: enrollment.class.feeAmount || 0,
      canSelect: ACTIVE_STATUSES.includes(enrollment.status),
    }));
  }, [student.enrollments, selectedStatus, formatSchedule]);

  const scholarshipPercent = student.scholarship?.percent || 0;

  // Paging
  const pagedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  // Định nghĩa columns cho DataTable
  const columns: Column<any>[] = useMemo(() => [
    {
      key: 'select',
      header: () => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAllActive}
            disabled={displayedActiveEnrollments.length === 0}
            className="h-auto p-1 text-xs"
          >
            {isAllActiveSelected ? (
              <CheckSquare className="h-4 w-4" />
            ) : isSomeActiveSelected ? (
              <div className="h-4 w-4 border border-primary bg-primary/20 rounded-sm flex items-center justify-center">
                <div className="h-2 w-2 bg-primary rounded-sm" />
              </div>
            ) : (
              <Square className="h-4 w-4" />
            )}
          </Button>
          <span className="text-xs text-muted-foreground">
            {displayedActiveEnrollments.length > 0 && 
              `(${selectedEnrollmentIds.filter(id => 
                displayedActiveEnrollments.some(e => e.id === id)
              ).length}/${displayedActiveEnrollments.length})`
            }
          </span>
        </div>
      ),
      render: (item) => (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedEnrollmentIds.includes(item.id)}
            disabled={!item.canSelect}
            onCheckedChange={(checked) => handleEnrollmentSelect(item.id, !!checked)}
          />
          {!item.canSelect && (
            <span className="text-xs text-muted-foreground">
              Không khả dụng
            </span>
          )}
        </div>
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
          ) : item.schedule && typeof item.schedule === 'string' ? (
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
    //   key: 'actions',
    //   header: 'Thao tác',
    //   render: (item) => (
    //     <div className="flex gap-2">
    //       <Button
    //         size="sm"
    //         onClick={() => handleViewAttendance(item.classId, item.id)}
    //         disabled={loadingAttendance}
    //       >
    //         {loadingAttendance && selectedEnrollmentId === item.id ? (
    //           <>
    //             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
    //             Đang tải...
    //           </>
    //         ) : (
    //           'Xem điểm danh'
    //         )}
    //       </Button>
    //     </div>
    //   ),
    // },
  ], [
    displayedActiveEnrollments,
    isAllActiveSelected,
    isSomeActiveSelected,
    selectedEnrollmentIds,
    handleSelectAllActive,
    handleEnrollmentSelect,
    loadingAttendance,
    selectedEnrollmentId,
    handleViewAttendance,
    formatDate
  ]);

  // Pagination config cho DataTable
  const paginationConfig = useMemo(() => ({
    currentPage,
    totalPages: Math.ceil(data.length / itemsPerPage),
    totalItems: data.length,
    itemsPerPage,
    onPageChange: setCurrentPage,
    onItemsPerPageChange: () => {},
    showItemsPerPage: false,
    showPageInfo: true,
  }), [currentPage, data.length, itemsPerPage]);
  
  // Filter UI
  const renderFilterButtons = useCallback(() => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button 
          onClick={() => setSelectedStatus(null)} 
          variant={selectedStatus === null ? 'default' : 'outline'}
          size="sm"
        >
          Tất cả
        </Button>
        {STATUS_ORDER.map(status => (
          <Button
            key={status}
            onClick={() => setSelectedStatus(status)}
            variant={selectedStatus === status ? 'default' : 'outline'}
            size="sm"
          >
            {ENROLLMENT_STATUS_LABELS[status]}
          </Button>
        ))}
      </div>
      
      {displayedActiveEnrollments.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllActive}
              className="text-xs"
            >
              {isAllActiveSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'} 
              ({displayedActiveEnrollments.length} lớp khả dụng)
            </Button>
          </div>
          
          {selectedEnrollmentIds.length > 0 && (
            <div className="text-primary font-medium">
              Đã chọn: {selectedEnrollmentIds.length} lớp
            </div>
          )}
        </div>
      )}
      
      {activeEnrollments.length === 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ Không có lớp học nào đang hoạt động để tính phí
        </div>
      )}
    </div>
  ), [selectedStatus, displayedActiveEnrollments, isAllActiveSelected, handleSelectAllActive, selectedEnrollmentIds, activeEnrollments]);

  // Fee Calculation Modal Component
  const FeeCalculationModal = React.memo(() => (
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
            <Alert variant="destructive" className="text-sm">
              Lưu ý khi thanh toán: Hệ thống sẽ hiểu rằng học sinh muốn nghỉ học luôn. Hệ thống sẽ đưa học sinh ra khỏi lớp.
            </Alert>
            
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
              disabled={loadingCalculation}
              className="flex items-center gap-2"
            >
              {loadingCalculation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang tính toán...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Tính theo buổi đã học
                </>
              )}
            </Button>
          )}
          {attendanceCalculationData && (
            <Button 
              onClick={() => setShowBillingModal(true)}
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Tạo hóa đơn
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  ));

  FeeCalculationModal.displayName = 'FeeCalculationModal';

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
            {/* <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowCalculationModal(true)}
              className="flex items-center gap-2"
              disabled={loadingCalculation}
            >
              <Calculator className="h-4 w-4" />
              Tính theo giá gốc
            </Button> */}
            <Button 
              size="sm" 
              onClick={handleCalculateAttendanceFees}
              disabled={loadingCalculation}
              className="flex items-center gap-2"
            >
              {loadingCalculation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Đang tính toán...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Tính theo buổi đã học
                </>
              )}
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
      
      {/* Billing Modal */}
      <BillingModal
        open={showBillingModal}
        onOpenChange={setShowBillingModal}
        attendanceCalculationData={attendanceCalculationData}
        selectedEnrollmentsSummary={selectedEnrollmentsSummary}
        onCreateBilling={handleCreateBilling}
        loadingBilling={loadingBilling}
        setShowCalculationModal={setShowCalculationModal}
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
