import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  BookOpen,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '../../../utils/format';
import type { TeacherStudentLeaveRequest } from '../../../services/teacher/student-leave-request/student-leave.types';
import { teacherStudentLeaveRequestService } from '../../../services/teacher/student-leave-request/student-leave.service';
import { toast } from 'sonner';

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

// Status labels
const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

interface StudentLeaveRequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  leaveRequest: TeacherStudentLeaveRequest | null;
}

export default function StudentLeaveRequestDetailModal({
  open,
  onClose,
  leaveRequest: initialLeaveRequest,
}: StudentLeaveRequestDetailModalProps) {
  const [leaveRequest, setLeaveRequest] = useState<TeacherStudentLeaveRequest | null>(initialLeaveRequest);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Refetch data when modal opens
  useEffect(() => {
    if (open && initialLeaveRequest?.id) {
      const fetchLatestData = async () => {
        try {
          setIsLoading(true);
          const latestData = await teacherStudentLeaveRequestService.getStudentLeaveRequestById(initialLeaveRequest.id);
          setLeaveRequest(latestData);
        } catch (error) {
          console.error('Failed to refetch leave request:', error);
          // Fallback to initial data if fetch fails
          setLeaveRequest(initialLeaveRequest);
        } finally {
          setIsLoading(false);
        }
      };
      fetchLatestData();
    } else if (!open) {
      // Reset when modal closes
      setLeaveRequest(initialLeaveRequest);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialLeaveRequest?.id]);

  if (!leaveRequest) return null;

  // Helper function to format date with fallback
  const formatDateSafe = (dateStr: string | null | undefined, fallbackText: string = 'Chưa cập nhật') => {
    if (!dateStr) return fallbackText;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return fallbackText;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return fallbackText;
    }
  };

  const handleApprove = async () => {
    if (!leaveRequest) return;
    if (!confirm(`Bạn có chắc chắn muốn duyệt đơn nghỉ học của ${leaveRequest.student?.user.fullName}?`)) {
      return;
    }

    try {
      setIsApproving(true);
      await teacherStudentLeaveRequestService.approveStudentLeaveRequest(leaveRequest.id, {});
      toast.success('Đã duyệt đơn nghỉ học thành công');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi duyệt đơn';
      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!leaveRequest) return;
    const notes = prompt(`Nhập lý do từ chối đơn nghỉ học của ${leaveRequest.student?.user.fullName}:`);
    if (notes === null) return; // User cancelled

    try {
      setIsRejecting(true);
      await teacherStudentLeaveRequestService.rejectStudentLeaveRequest(leaveRequest.id, { notes });
      toast.success('Đã từ chối đơn nghỉ học');
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi từ chối đơn';
      toast.error(errorMessage);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold">
                    Chi tiết đơn nghỉ học
                  </DialogTitle>
                </div>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Đang tải dữ liệu mới nhất...</span>
            </div>
          ) : (
            <ScrollArea className="flex-1 px-6 py-2">
            <div className="space-y-6">
              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Student & Class Info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Thông tin học sinh và lớp học
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Học sinh
                        </label>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {leaveRequest.student?.user.fullName.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {leaveRequest.student?.user.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {leaveRequest.student?.user.email || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Lớp học bị ảnh hưởng
                        </label>
                        <div className="space-y-2">
                          {leaveRequest.classes && leaveRequest.classes.length > 0 ? (
                            leaveRequest.classes.map((cls, index) => (
                              <div key={index} className="bg-background p-2 rounded-md border">
                                <p className="text-sm font-medium">{cls.name}</p>
                                <p className="text-xs text-muted-foreground">{cls.subject?.name || ''}</p>
                                {cls.teacher && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    GV: {cls.teacher.user.fullName}
                                  </p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground italic">Không có buổi học nào trong khoảng thời gian này</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Thông tin đơn
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Lý do nghỉ học
                        </label>
                        <p className="text-sm bg-background rounded-md p-3 border">
                          {leaveRequest.reason}
                        </p>
                      </div>
                      {leaveRequest.notes && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Ghi chú thêm
                          </label>
                          <p className="text-sm bg-background rounded-md p-3 border">
                            {leaveRequest.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Affected Sessions */}
                  {leaveRequest.affectedSessions && leaveRequest.affectedSessions.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Buổi học bị ảnh hưởng ({leaveRequest.affectedSessions.length})
                      </h3>
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {leaveRequest.affectedSessions.map((session, index) => (
                          <div
                            key={index}
                            className="bg-background rounded-md p-3 border flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 bg-primary/10 rounded-md flex-shrink-0">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">
                                  {session.session.class.name || 'Lớp học'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(session.session.sessionDate)} - {session.session.startTime} - {session.session.endTime}
                                </p>
                                {session.session.class.subject && (
                                  <p className="text-xs text-muted-foreground">
                                    Môn: {session.session.class.subject.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                              {session.session.room?.name || 'Phòng học'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {leaveRequest.affectedSessions.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          Cuộn để xem thêm {leaveRequest.affectedSessions.length - 5} buổi học
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Column - Metadata */}
                <div className="space-y-6">
                  {/* Date Information */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Thời gian nghỉ
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ngày bắt đầu:</span>
                        <span className="font-medium">{formatDate(leaveRequest.startDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ngày kết thúc:</span>
                        <span className="font-medium">{formatDate(leaveRequest.endDate)}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Số ngày nghỉ:</span>
                        <span className="font-medium">
                          {Math.ceil((new Date(leaveRequest.endDate).getTime() - new Date(leaveRequest.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} ngày
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Thông tin đơn
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ngày tạo:</span>
                        <span className="font-medium">{formatDateSafe(leaveRequest.createdAt, 'Không xác định')}</span>
                      </div>
                      {leaveRequest.updatedAt && leaveRequest.updatedAt !== leaveRequest.createdAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cập nhật cuối:</span>
                          <span className="font-medium">{formatDateSafe(leaveRequest.updatedAt, 'Chưa cập nhật')}</span>
                        </div>
                      )}
                      {leaveRequest.approvedAt && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Ngày phê duyệt:</span>
                          <span className="font-medium">{formatDateSafe(leaveRequest.approvedAt, 'Chưa phê duyệt')}</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Trạng thái:</span>
                        <Badge
                          variant="secondary"
                          className={statusColors[leaveRequest.status as keyof typeof statusColors]}
                        >
                          {statusLabels[leaveRequest.status as keyof typeof statusLabels]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Approver Info */}
                  {leaveRequest.approvedByUser && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Người phê duyệt
                      </h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {leaveRequest.approvedByUser.fullName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {leaveRequest.approvedByUser.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {leaveRequest.approvedByUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </ScrollArea>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-muted/20">
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              {leaveRequest?.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isRejecting || isApproving}
                  >
                    {isRejecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Từ chối
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Duyệt đơn
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

