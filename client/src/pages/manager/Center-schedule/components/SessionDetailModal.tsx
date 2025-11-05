'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  BookOpen,
  AlertTriangle,
  Phone,
} from 'lucide-react';
import { ClassSessions } from '../../Teacher-management/types/session';

interface SessionDetailModalProps {
  session: ClassSessions | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
}: SessionDetailModalProps) {
  if (!session) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'has_not_happened':
        return 'Chưa diễn ra';
      case 'happening':
        return 'Đang diễn ra';
      case 'end':
        return 'Đã kết thúc';
      case 'cancelled':
        return 'Đã hủy';
      case 'day_off':
        return 'Nghỉ';
      default:
        return 'Không xác định';
    }
  };

  const getStatusVariant = (
    status: string,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'has_not_happened':
        return 'default';
      case 'happening':
        return 'secondary';
      case 'end':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      case 'day_off':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5); // Remove seconds
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Chi tiết {session.name || "Chưa phân lớp"}
            {session.hasAlert && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <div className="flex items-center justify-between">
            <Badge variant={getStatusVariant(session.status)}>
              {getStatusText(session.status)}
            </Badge>
            <div className="text-sm text-muted-foreground">
              ID: {session.id}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Ngày học</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(session.date)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium">Thời gian</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(session.startTime)} -{' '}
                  {formatTime(session.endTime)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location and Teacher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-chart-2" />
              <div>
                <div className="font-medium">Phòng học</div>
                <div className="text-sm text-muted-foreground">
                  {session.roomName || "Chưa phân phòng"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-chart-2" />
              <div>
                <div className="font-medium">Giáo viên</div>
                <div className="text-sm text-muted-foreground">
                  {session.teacherName || "Chưa phân giáo viên"}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Subject and Students */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-chart-4" />
              <div>
                <div className="font-medium">Môn học</div>
                <div className="text-sm text-muted-foreground">
                  {session.subjectName || "Chưa phân môn học"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-chart-4" />
              <div>
                <div className="font-medium">Học sinh</div>
                <div className="text-sm text-muted-foreground">
                  {session.studentCount}/{session.maxStudents} học sinh
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-1">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (session.studentCount / session.maxStudents) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Information */}
          {session.hasAlert && (
            <>
              <Separator />
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Cảnh báo
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  {session.studentCount < 5
                    ? 'Số lượng học sinh ít, cần xem xét việc ghép lớp hoặc hủy buổi học.'
                    : 'Buổi học cần được chú ý đặc biệt.'}
                </div>
              </div>
            </>
          )}

          {/* Additional Information */}
          <Separator />
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Thông tin bổ sung</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Thời lượng:</span>{' '}
                {(() => {
                  const start = new Date(`2000-01-01T${session.startTime}`);
                  const end = new Date(`2000-01-01T${session.endTime}`);
                  const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                  return `${diff} phút`;
                })()}
              </div>
              <div>
                <span className="font-medium">Tỷ lệ lấp đầy:</span>{' '}
                {Math.round((session.studentCount / session.maxStudents) * 100)}
                %
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              <User className="h-4 w-4 mr-2" />
              Xem danh sách học sinh
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Liên hệ giáo viên
            </Button>
            <Button onClick={onClose} className="flex-1">
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
