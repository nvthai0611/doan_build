import { useState } from 'react';
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
  CLASS_STATUS_TRANSITIONS 
} from '../../../../lib/constants';
import { AlertTriangle, CheckCircle, Info, ArrowRight } from 'lucide-react';
import { classService } from '../../../../services/center-owner/class-management/class.service';
import { useToast } from '../../../../hooks/use-toast';
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
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
    
  const currentStatus = classData?.status as ClassStatus;
  const allowedTransitions = CLASS_STATUS_TRANSITIONS[currentStatus] || [];

  // Get validation messages for each status transition
  const getValidationMessage = (targetStatus: ClassStatus) => {
    if (currentStatus === ClassStatus.DRAFT && targetStatus === ClassStatus.READY) {
      return {
        type: 'info' as const,
        message: 'Lớp cần có giáo viên, phòng học, và lịch học trước khi mở tuyển sinh.',
      };
    }
    
    if (currentStatus === ClassStatus.READY && targetStatus === ClassStatus.ACTIVE) {
      const studentCount = classData?.enrollments?.length || 0;
      
      if (studentCount < 5) {
        return {
          type: 'warning' as const,
          message: `Lớp hiện có ${studentCount} học sinh. Hệ thống sẽ tự động tạo lịch học cho toàn bộ khóa học. Bạn có muốn tiếp tục không?`,
        };
      }
      
      return {
        type: 'info' as const,
        message: `Lớp hiện có ${studentCount} học sinh. Hệ thống sẽ tự động tạo lịch học cho toàn bộ khóa học dựa trên lịch học tuần.`,
      };
    }
    
    if (currentStatus === ClassStatus.ACTIVE && targetStatus === ClassStatus.COMPLETED) {
      return {
        type: 'info' as const,
        message: 'Lớp sẽ được đánh dấu là đã hoàn thành. Tất cả học sinh sẽ được cập nhật trạng thái.',
      };
    }
    
    if (currentStatus === ClassStatus.ACTIVE && targetStatus === ClassStatus.SUSPENDED) {
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

  const handleChangeStatus = async () => {
    if (!selectedStatus) return;

    // Kiểm tra số học sinh khi chuyển sang active
    const studentCount = classData?._count?.enrollments || classData?.enrollments?.length || 0;
    if (currentStatus === ClassStatus.READY && selectedStatus === ClassStatus.ACTIVE && studentCount < 5) {
      setWarningMessage(`Lớp hiện có ${studentCount} học sinh. Hệ thống sẽ tự động tạo lịch học cho toàn bộ khóa học. Bạn có muốn tiếp tục không?`);
      setShowConfirmWarning(true);
      onOpenChange(false); // Đóng dialog chính
      return;
    }

    // Tiến hành update
    await performUpdate();
  };

  const performUpdate = async () => {
    setIsLoading(true);
    try {
      // Call API to update status
      const response = await classService.updateClass(classData.id, {
        status: selectedStatus,
      }) as any;

      // Hiển thị message từ backend
      // Sau khi qua ResponseInterceptor, cấu trúc là: { success, status, data, message, warning, ... }
      const statusLabel = selectedStatus ? CLASS_STATUS_LABELS[selectedStatus as ClassStatus] : 'mới';
      const message = response?.message || `Đã chuyển trạng thái lớp sang "${statusLabel}"`;
      const hasWarning = response?.warning;

      toast({
        title: hasWarning ? 'Thành công (có cảnh báo)' : 'Thành công',
        description: message,
        variant: hasWarning ? 'default' : 'default',
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
      await queryClient.invalidateQueries({ queryKey: ['classDetail', classData.id] });
      await queryClient.invalidateQueries({ queryKey: ['classSessions', classData.id] });
      
      onSuccess();
      onOpenChange(false);
      setSelectedStatus('');
      setShowConfirmWarning(false);
      setWarningMessage('');
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể chuyển trạng thái lớp',
        variant: 'destructive',
      });
      setShowConfirmWarning(false);
    } finally {
      setIsLoading(false);
    }
  };

  const validationMessage = selectedStatus ? getValidationMessage(selectedStatus as ClassStatus) : null;

  const handleConfirmWarning = async () => {
    setShowConfirmWarning(false);
    await performUpdate();
  };

  const handleCancelWarning = () => {
    setShowConfirmWarning(false);
    setWarningMessage('');
    setSelectedStatus(''); // Reset selected status
    onOpenChange(true); // Mở lại dialog chính để user có thể chọn lại
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

      {/* Main Status Change Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chuyển trạng thái lớp học</DialogTitle>
          <DialogDescription>
            Chọn trạng thái mới cho lớp <strong>{classData?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 min-w-[120px]">Trạng thái hiện tại:</span>
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
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ClassStatus)}>
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
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          status === ClassStatus.ACTIVE ? 'bg-green-500' :
                          status === ClassStatus.READY ? 'bg-yellow-500' :
                          status === ClassStatus.COMPLETED ? 'bg-blue-500' :
                          status === ClassStatus.SUSPENDED ? 'bg-orange-500' :
                          status === ClassStatus.CANCELLED ? 'bg-red-500' :
                          'bg-gray-500'
                        }`} />
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
            <Alert className={
              validationMessage.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            }>
              <div className="flex gap-2">
                {validationMessage.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                ) : (
                  <Info className="w-4 h-4 text-blue-600" />
                )}
                <AlertDescription className={
                  validationMessage.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }>
                  {validationMessage.message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Additional Info for Active Status */}
          {selectedStatus === ClassStatus.ACTIVE && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 space-y-1">
                  <p className="font-medium">Khi chuyển sang "Đang hoạt động":</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Hệ thống sẽ tự động tạo tất cả buổi học trong năm học</li>
                    <li>Lịch học được tạo dựa trên lịch tuần đã cài đặt</li>
                    <li>Giáo viên có thể bắt đầu điểm danh</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedStatus('');
            }}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangeStatus}
            disabled={!selectedStatus || isLoading}
            className={
              selectedStatus === ClassStatus.CANCELLED ? 'bg-yellow-600 hover:bg-yellow-700' :
              selectedStatus === ClassStatus.ACTIVE ? 'bg-green-600 hover:bg-green-700' :
              ''
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

