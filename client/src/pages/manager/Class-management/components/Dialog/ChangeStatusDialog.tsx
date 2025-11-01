import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClassStatus,
  CLASS_STATUS_LABELS,
  CLASS_STATUS_BADGE_COLORS,
  CLASS_STATUS_TRANSITIONS,
} from '../../../../../lib/constants';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { classService } from '../../../../../services/center-owner/class-management/class.service';
import { useToast } from '../../../../../hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ChangeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: any;
  onSuccess: () => void;
}

export const ChangeStatusDialog = ({
  open,
  onOpenChange,
  classData,
  onSuccess,
}: ChangeStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<ClassStatus | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSessions, setIsCheckingSessions] = useState(false);
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [showDateForm, setShowDateForm] = useState(false);
  const [showDeleteSessionsWarning, setShowDeleteSessionsWarning] =
    useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [hasExistingSessions, setHasExistingSessions] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Lưu giá trị tạm thời khi chuyển sang dialog xác nhận
  const [pendingStatus, setPendingStatus] = useState<ClassStatus | ''>('');
  const [pendingStartDate, setPendingStartDate] = useState('');
  const [pendingEndDate, setPendingEndDate] = useState('');
  // Tạo lịch học là bắt buộc, không cho phép thay đổi
  const wantToGenerateSessions = true;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentStatus = classData?.status as ClassStatus;
  const allowedTransitions = CLASS_STATUS_TRANSITIONS[currentStatus] || [];

  // Tính ngày mặc định khi chọn active
  useEffect(() => {
    if (
      selectedStatus === ClassStatus.ACTIVE &&
      currentStatus === ClassStatus.READY
    ) {
      // Ngày bắt đầu: expectedStartDate hoặc ngày hiện tại
      const defaultStartDate = classData?.expectedStartDate
        ? new Date(classData.expectedStartDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      // Ngày kết thúc: 31/05 năm sau (từ ngày bắt đầu)
      const startDateObj = new Date(defaultStartDate);
      const nextYear = startDateObj.getFullYear() + 1;
      const defaultEndDate = `${nextYear}-05-31`;

      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
    }
  }, [selectedStatus, classData?.expectedStartDate, currentStatus]);

  // Check sessions khi chọn active
  useEffect(() => {
    const checkSessions = async () => {
      if (
        selectedStatus === ClassStatus.ACTIVE &&
        currentStatus === ClassStatus.READY
      ) {
        setIsCheckingSessions(true);
        try {
          const response = (await classService.getClassSessions(classData.id, {
            limit: 1,
            page: 1,
          })) as any;
          const total = response?.meta?.total || 0;
          setSessionCount(total);
          setHasExistingSessions(total > 0);

          // Nếu có sessions và muốn tạo sessions, hiển thị warning
          if (total > 0 && wantToGenerateSessions) {
            setShowDeleteSessionsWarning(true);
          } else if (total === 0 && wantToGenerateSessions) {
            setShowDateForm(true);
          }
        } catch (error) {
          console.error('Error checking sessions:', error);
          // Giả sử không có sessions nếu lỗi
          setHasExistingSessions(false);
          if (wantToGenerateSessions) {
            setShowDateForm(true);
          }
        } finally {
          setIsCheckingSessions(false);
        }
      } else {
        setShowDateForm(false);
        setShowDeleteSessionsWarning(false);
        setHasExistingSessions(false);
      }
    };

    if (open && selectedStatus) {
      checkSessions();
    }
  }, [selectedStatus, open, classData?.id, currentStatus, wantToGenerateSessions]);

  // Reset khi đóng dialog (chỉ reset khi cả dialog chính và dialog xác nhận đều đóng)
  useEffect(() => {
    if (!open && !showConfirmWarning && !showDeleteSessionsWarning) {
      setSelectedStatus('');
      setShowDateForm(false);
      setHasExistingSessions(false);
      setSessionCount(0);
      setStartDate('');
      setEndDate('');
      // Chỉ reset warningMessage khi tất cả dialog đều đóng
      setWarningMessage('');
      // Reset pending state
      setPendingStatus('');
      setPendingStartDate('');
      setPendingEndDate('');
    }
  }, [open, showConfirmWarning, showDeleteSessionsWarning]);

  // Get validation messages for each status transition
  const getValidationMessage = (targetStatus: ClassStatus) => {
    if (
      currentStatus === ClassStatus.DRAFT &&
      targetStatus === ClassStatus.READY
    ) {
      return {
        type: 'info' as const,
        message:
          'Lớp cần có giáo viên, phòng học, và lịch học trước khi mở tuyển sinh.',
      };
    }

    if (
      currentStatus === ClassStatus.READY &&
      targetStatus === ClassStatus.ACTIVE
    ) {
      const studentCount = classData?.enrollments?.length || 0;

      if (studentCount < 5) {
        return {
          type: 'warning' as const,
          message: `Lớp hiện có ${studentCount} học sinh. Bạn có muốn tạo lịch học cho lớp không?`,
        };
      }

      return {
        type: 'info' as const,
        message: `Lớp hiện có ${studentCount} học sinh. Bạn có muốn tạo lịch học cho lớp không?`,
      };
    }

    if (
      currentStatus === ClassStatus.ACTIVE &&
      targetStatus === ClassStatus.COMPLETED
    ) {
      return {
        type: 'info' as const,
        message:
          'Lớp sẽ được đánh dấu là đã hoàn thành. Tất cả học sinh sẽ được cập nhật trạng thái.',
      };
    }

    if (
      currentStatus === ClassStatus.ACTIVE &&
      targetStatus === ClassStatus.SUSPENDED
    ) {
      return {
        type: 'info' as const,
        message: 'Lớp sẽ tạm dừng. Bạn có thể tiếp tục lớp sau này.',
      };
    }

    if (targetStatus === ClassStatus.CANCELLED) {
      return {
        type: 'warning' as const,
        message: 'Hủy lớp là hành động không thể hoàn tác. Vui lòng xác nhận!',
      };
    }

    return null;
  };

  // === FIX 1: THAY ĐỔI LOGIC MỞ DIALOG XÁC NHẬN ===
  const handleChangeStatus = async () => {
    if (!selectedStatus) return;

    // Nếu chuyển sang active từ ready
    if (
      currentStatus === ClassStatus.READY &&
      selectedStatus === ClassStatus.ACTIVE
    ) {
      // Kiểm tra số học sinh
      const studentCount =
        classData?._count?.enrollments || classData?.enrollments?.length || 0;

      // Nếu có sessions hiện có, đã xử lý trong useEffect - hiển thị warning xóa
      if (hasExistingSessions) {
        // Nút "Xác nhận" đã bị disabled, nhưng để an toàn
        return;
      }

      // Kiểm tra đã nhập ngày chưa
      if (!startDate || !endDate) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng nhập ngày bắt đầu và ngày kết thúc',
          variant: 'destructive',
        });
        return;
      }

      // Hiển thị dialog xác nhận cuối cùng trước khi thực hiện
      const message = `Bạn sắp chuyển lớp "${
        classData?.name
      }" sang trạng thái "Đang hoạt động" và tạo lịch học từ ${new Date(
        startDate,
      ).toLocaleDateString('vi-VN')} đến ${new Date(
        endDate,
      ).toLocaleDateString(
        'vi-VN',
      )}. ${studentCount < 5 ? `Lớp hiện có ${studentCount} học sinh (dưới 15 học sinh).` : ''} Bạn có chắc chắn muốn tiếp tục không?`;

      // Lưu giá trị vào pending state
      setPendingStatus(selectedStatus);
      setPendingStartDate(startDate);
      setPendingEndDate(endDate);

      // FIX: Không đóng dialog chính (onOpenChange(false))
      // và không dùng setTimeout. Chỉ cần mở dialog xác nhận.
      setWarningMessage(message);
      setShowConfirmWarning(true);
      return;
    }

    // Tiến hành update cho các trường hợp khác
    await performUpdate();
  };

  const handleDeleteSessionsAndContinue = async () => {
    try {
      setIsLoading(true);

      // Lấy tất cả session IDs
      const sessionsResponse = (await classService.getClassSessions(
        classData.id,
        { limit: 1000 },
      )) as any;
      const allSessions = Array.isArray(sessionsResponse?.data)
        ? sessionsResponse.data
        : [];
      const sessionIds = allSessions.map((s: any) => s.id);

      if (sessionIds.length > 0) {
        // Xóa tất cả sessions
        await classService.deleteSessions(classData.id, sessionIds);
      }

      setShowDeleteSessionsWarning(false);
      // Tiếp tục với form nhập ngày
      setShowDateForm(true);
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xóa buổi học',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const performUpdate = async () => {
    setIsLoading(true);
    try {
      // Sử dụng pending state nếu có (khi chuyển từ dialog xác nhận), ngược lại dùng selectedStatus
      const statusToUse = pendingStatus || selectedStatus;
      const startDateToUse = pendingStartDate || startDate;
      const endDateToUse = pendingEndDate || endDate;

      // Validate status - đảm bảo có giá trị hợp lệ
      if (!statusToUse) {
        toast({
          title: 'Lỗi',
          description: 'Vui lòng chọn trạng thái mới',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Đảm bảo status là string value của enum (ví dụ: 'active', 'ready', etc.)
      const statusValue =
        typeof statusToUse === 'string' ? statusToUse : String(statusToUse);

      // Validate status value hợp lệ
      const validStatuses = [
        'draft',
        'ready',
        'active',
        'completed',
        'suspended',
        'cancelled',
      ];
      if (!validStatuses.includes(statusValue)) {
        toast({
          title: 'Lỗi',
          description: 'Trạng thái không hợp lệ',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const response = (await classService.updateClassStatus(
        classData.id,
        statusValue,
        currentStatus === ClassStatus.READY && statusValue === ClassStatus.ACTIVE
          ? startDateToUse
          : undefined,
        currentStatus === ClassStatus.READY && statusValue === ClassStatus.ACTIVE
          ? endDateToUse
          : undefined,
      )) as any;

      const statusLabel = statusValue
        ? CLASS_STATUS_LABELS[statusValue as ClassStatus]
        : 'mới';
      const message =
        response?.message ||
        `Đã chuyển trạng thái lớp sang "${statusLabel}"`;
      const hasWarning = response?.warning;
      toast({
        title: hasWarning ? 'Thành công (có cảnh báo)' : 'Thành công',
        description: message,
      });

      // Hiển thị warning riêng nếu có (từ backend)
      if (hasWarning) {
        setTimeout(() => {
          toast({
            title: 'Lưu ý',
            description: String(hasWarning),
          });
        }, 1000);
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({
        queryKey: ['classDetail', classData.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ['classSessions', classData.id],
      });

      onSuccess();
      onOpenChange(false); // Đây là nơi duy nhất đóng dialog chính khi thành công
      setSelectedStatus(''); // Reset state sau khi đóng
      setShowConfirmWarning(false);
      setShowDateForm(false);
      setShowDeleteSessionsWarning(false);
      setWarningMessage('');
      // Reset pending state
      setPendingStatus('');
      setPendingStartDate('');
      setPendingEndDate('');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.message || 'Không thể chuyển trạng thái lớp',
        variant: 'destructive',
      });
      setShowConfirmWarning(false);
      // Reset pending state khi có lỗi
      setPendingStatus('');
      setPendingStartDate('');
      setPendingEndDate('');
    } finally {
      setIsLoading(false);
    }
  };

  const validationMessage = selectedStatus
    ? getValidationMessage(selectedStatus as ClassStatus)
    : null;

  const handleConfirmWarning = async () => {
    setShowConfirmWarning(false);
    await performUpdate();
  };

  // === FIX 2: THAY ĐỔI LOGIC HỦY DIALOG XÁC NHẬN ===
  const handleCancelWarning = () => {
    setShowConfirmWarning(false); // Chỉ đóng dialog warning
    setWarningMessage('');
    
    // Reset pending state vì hành động "pending" đã bị hủy
    setPendingStatus('');
    setPendingStartDate('');
    setPendingEndDate('');

    // FIX: Không reset selectedStatus và không mở lại dialog chính
    // (vì nó vẫn đang mở bên dưới)
    // setSelectedStatus('');
    // onOpenChange(true);
  };

  // === FIX 3: THAY ĐỔI LOGIC HỦY DIALOG XÓA SESSION ===
  const handleCancelDeleteSessions = () => {
    setShowDeleteSessionsWarning(false); // Chỉ đóng dialog warning
    
    // FIX: Vẫn reset selectedStatus để buộc người dùng chọn lại
    // (đây là luồng UX đúng khi họ hủy bỏ điều kiện tiên quyết)
    setSelectedStatus('');
    
    // FIX: Không mở lại dialog chính (vì nó vẫn đang mở)
    // onOpenChange(true); 
  };

  return (
    <>
      {/* Warning Confirmation Dialog */}
      <Dialog open={showConfirmWarning} onOpenChange={setShowConfirmWarning}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Xác nhận chuyển trạng thái
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertDescription className="text-yellow-800">
                {warningMessage}
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelWarning}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmWarning}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận tiếp tục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Sessions Warning Dialog */}
      <Dialog
        open={showDeleteSessionsWarning}
        onOpenChange={setShowDeleteSessionsWarning}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Xóa buổi học hiện có
            </DialogTitle>
            <DialogDescription>
              Lớp học hiện có <strong>{sessionCount} buổi học</strong>. Để tạo
              lịch học mới, bạn cần xóa tất cả buổi học hiện có.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Alert className="border-red-500 bg-red-50">
              <AlertDescription className="text-red-800">
                <strong>Lưu ý:</strong> Hành động này sẽ xóa tất cả{' '}
                {sessionCount} buổi học hiện có. Bạn có chắc chắn muốn tiếp
                tục không?
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelDeleteSessions}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteSessionsAndContinue}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Đang xóa...' : 'Xóa và tiếp tục'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Status Change Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chuyển trạng thái lớp học</DialogTitle>
            <DialogDescription>
              Chọn trạng thái mới cho lớp <strong>{classData?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 min-w-[120px]">
                Trạng thái hiện tại:
              </span>
              <Badge className={CLASS_STATUS_BADGE_COLORS[currentStatus]}>
                {CLASS_STATUS_LABELS[currentStatus]}
              </Badge>
            </div>

            {/* Arrow */}
            {selectedStatus && (
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            )}

            {/* New Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái mới</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as ClassStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái mới..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedTransitions.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Không có trạng thái khả dụng
                    </div>
                  ) : (
                    allowedTransitions.map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              status === ClassStatus.ACTIVE
                                ? 'bg-green-500'
                                : status === ClassStatus.READY
                                  ? 'bg-yellow-500'
                                  : status === ClassStatus.COMPLETED
                                    ? 'bg-blue-500'
                                    : status === ClassStatus.SUSPENDED
                                      ? 'bg-orange-500'
                                      : status === ClassStatus.CANCELLED
                                        ? 'bg-red-500'
                                        : 'bg-gray-500'
                            }`}
                          />
                          {CLASS_STATUS_LABELS[status]}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <Alert
                className={
                  validationMessage.type === 'warning'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'
                }
              >
                <div className="flex gap-2">
                  {validationMessage.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600" />
                  )}
                  <AlertDescription
                    className={
                      validationMessage.type === 'warning'
                        ? 'text-yellow-800'
                        : 'text-blue-800'
                    }
                  >
                    {validationMessage.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Additional Info for Active Status */}
            {selectedStatus === ClassStatus.ACTIVE &&
              currentStatus === ClassStatus.READY && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800 space-y-2 flex-1">
                      <p className="font-medium">
                        Khi chuyển sang "Đang hoạt động":
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Hệ thống sẽ <strong>bắt buộc</strong> tạo lịch học tự
                          động cho lớp
                        </li>
                        <li>Lịch học được tạo dựa trên lịch tuần đã cài đặt</li>
                        <li>
                          Giáo viên có thể bắt đầu điểm danh sau khi tạo lịch
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            {/* Date Form - Hiển thị khi chuyển sang active và không có sessions hoặc đã xóa */}
            {showDateForm &&
              selectedStatus === ClassStatus.ACTIVE &&
              currentStatus === ClassStatus.READY && (
                <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <Label className="text-sm font-medium">
                      Thiết lập thời gian khóa học
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          // Tự động cập nhật ngày kết thúc nếu cần
                          if (e.target.value && !endDate) {
                            const startDateObj = new Date(e.target.value);
                            const nextYear = startDateObj.getFullYear() + 1;
                            setEndDate(`${nextYear}-05-31`);
                          }
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm">
                        Ngày kết thúc <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {startDate &&
                    endDate &&
                    new Date(startDate) >= new Date(endDate) && (
                      <Alert className="border-red-500 bg-red-50">
                        <AlertDescription className="text-red-800 text-sm">
                          Ngày kết thúc phải sau ngày bắt đầu
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              )}

            {/* Loading indicator khi đang check sessions */}
            {isCheckingSessions && (
              <div className="text-sm text-gray-500 text-center py-2">
                Đang kiểm tra buổi học hiện có...
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                // `useEffect` cleanup sẽ tự động reset state
                // nhưng gọi ở đây cũng tốt để reset ngay lập tức
                setSelectedStatus('');
              }}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={
                !selectedStatus ||
                isLoading ||
                (selectedStatus === ClassStatus.ACTIVE &&
                  currentStatus === ClassStatus.READY &&
                  (!startDate ||
                    !endDate ||
                    new Date(startDate) >= new Date(endDate))) ||
                isCheckingSessions ||
                showDeleteSessionsWarning
              }
              className={
                selectedStatus === ClassStatus.CANCELLED
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : selectedStatus === ClassStatus.ACTIVE
                    ? 'bg-green-600 hover:bg-green-700'
                    : ''
              }
            >
              {isLoading ? 'Đang xử lý...' : 'Xác nhận chuyển trạng thái'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};