'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '../../../utils/format';
import type { LeaveRequest } from '../../../services/teacher/leave-request/leave.types';
import type { SessionRequestResponse } from '../../../services/teacher/session-request/session-request.types';
import type { ScheduleChangeResponse } from '../../../services/teacher/schedule-change/schedule-change.types';

// Status colors
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
};

// Request type colors
const requestTypeColors = {
  // Leave request types
  sick_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  personal_leave: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  emergency_leave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
  // Session request types
  makeup_session: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  extra_session: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
  // Schedule change types
  reschedule: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
};

// Request type labels
const requestTypeLabels = {
  // Leave request types
  sick_leave: 'Nghỉ ốm',
  personal_leave: 'Nghỉ phép',
  emergency_leave: 'Nghỉ khẩn cấp',
  other: 'Khác',
  // Session request types
  makeup_session: 'Bù buổi học',
  extra_session: 'Buổi học bổ sung',
  // Schedule change types
  reschedule: 'Dời lịch',
};

// Status labels
const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

// Status icons
const statusIcons = {
  pending: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  cancelled: XCircle,
};

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest?: LeaveRequest | null;
  sessionRequest?: SessionRequestResponse | null;
  scheduleChange?: ScheduleChangeResponse | null;
  requestType?: string;
}

export default function RequestDetailModal({
  isOpen,
  onClose,
  leaveRequest,
  sessionRequest,
  scheduleChange,
  requestType = 'leave',
}: RequestDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get current data based on request type
  const getCurrentData = () => {
    switch (requestType) {
      case 'leave':
        return leaveRequest;
      case 'session':
        return sessionRequest;
      case 'schedule':
        return scheduleChange;
      default:
        return leaveRequest;
    }
  };

  const currentData = getCurrentData();
  if (!currentData) return null;

  const StatusIcon = statusIcons[currentData.status as keyof typeof statusIcons] || AlertCircle;

  // Render content based on request type
  const renderContent = () => {
    switch (requestType) {
      case 'leave':
        return renderLeaveRequestContent(leaveRequest as LeaveRequest);
      case 'session':
        return renderSessionRequestContent(sessionRequest as SessionRequestResponse);
      case 'schedule':
        return renderScheduleChangeContent(scheduleChange as ScheduleChangeResponse);
      default:
        return renderLeaveRequestContent(leaveRequest as LeaveRequest);
    }
  };

  const renderLeaveRequestContent = (data: LeaveRequest) => (
    <>
      {/* Header */}
      <DialogHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Chi tiết đơn xin nghỉ
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                ID: {data.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={requestTypeColors[data.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
            >
              {requestTypeLabels[data.requestType as keyof typeof requestTypeLabels] || data.requestType}
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[data.status as keyof typeof statusLabels] || data.status}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6">
          {/* Leave Information */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Thông tin nghỉ phép
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày bắt đầu</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.startDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày kết thúc</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.endDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Số ngày nghỉ</p>
                    <p className="text-sm text-muted-foreground">{Math.ceil((new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} ngày</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày tạo</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Chi tiết đơn xin nghỉ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Loại nghỉ</p>
                <Badge
                  variant="secondary"
                  className={requestTypeColors[data.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
                >
                  {requestTypeLabels[data.requestType as keyof typeof requestTypeColors] || data.requestType}
                </Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Trạng thái</p>
                <Badge
                  variant="secondary"
                  className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[data.status as keyof typeof statusLabels] || data.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Lý do xin nghỉ
            </h3>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm leading-relaxed">{data.reason}</p>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Ghi chú bổ sung
                </h3>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm leading-relaxed">{data.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Affected Sessions */}
          {data.affectedSessions && data.affectedSessions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-red-600" />
                  Sessions bị ảnh hưởng
                </h3>
                <div className="space-y-3">
                  {data.affectedSessions.map((session, index) => (
                    <div key={index} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900 dark:text-red-100">{session.session?.class?.subject?.name}</p>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            {formatDate(session.session?.sessionDate)} - {session.session?.startTime} → {session.session?.endTime}
                          </p>
                        </div>
                        {session.replacementTeacher && (
                          <Badge variant="outline" className="border-green-500 text-green-700">
                            Thay thế: {session.replacementTeacher.user?.fullName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Teacher Information */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Thông tin giáo viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-1">Giáo viên</p>
                <p className="text-sm text-muted-foreground">{data.teacher?.user?.fullName || 'N/A'}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-1">Người tạo đơn</p>
                <p className="text-sm text-muted-foreground">{data.createdByUser?.fullName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Lịch sử đơn xin nghỉ
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Đơn được tạo</p>
                  <p className="text-xs text-muted-foreground">{formatDate(data.createdAt.toString())}</p>
                </div>
              </div>
              {data.approvedAt && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Đơn được duyệt</p>
                    <p className="text-xs text-muted-foreground">{formatDate(data.approvedAt.toString())}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );

  const renderSessionRequestContent = (data: SessionRequestResponse) => (
    <>
      {/* Header */}
      <DialogHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Chi tiết yêu cầu tạo buổi học
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                ID: {data.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={requestTypeColors[data.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
            >
              {requestTypeLabels[data.requestType as keyof typeof requestTypeLabels] || data.requestType}
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[data.status as keyof typeof statusLabels] || data.status}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6">
          {/* Session Information */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Thông tin buổi học
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lớp học</p>
                    <p className="text-sm text-muted-foreground">{data.class.name}</p>
                    <p className="text-xs text-muted-foreground">{data.class.subject.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày học</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.sessionDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Thời gian</p>
                    <p className="text-sm text-muted-foreground">{data.startTime} - {data.endTime}</p>
                  </div>
                </div>
                {data.room && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phòng học</p>
                      <p className="text-sm text-muted-foreground">{data.room.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Chi tiết yêu cầu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Loại yêu cầu</p>
                <Badge
                  variant="secondary"
                  className={requestTypeColors[data.requestType as keyof typeof requestTypeColors] || requestTypeColors.other}
                >
                  {requestTypeLabels[data.requestType as keyof typeof requestTypeColors] || data.requestType}
                </Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Trạng thái</p>
                <Badge
                  variant="secondary"
                  className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[data.status as keyof typeof statusLabels] || data.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Lý do yêu cầu
            </h3>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm leading-relaxed">{data.reason}</p>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Ghi chú bổ sung
                </h3>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm leading-relaxed">{data.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Teacher Information */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Thông tin giáo viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-1">Giáo viên</p>
                <p className="text-sm text-muted-foreground">{data.teacher.user.fullName}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium mb-1">Người tạo yêu cầu</p>
                <p className="text-sm text-muted-foreground">{data.createdByUser.fullName}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Lịch sử yêu cầu
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Yêu cầu được tạo</p>
                  <p className="text-xs text-muted-foreground">{formatDate(data.createdAt.toString())}</p>
                </div>
              </div>
              {data.approvedAt && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Yêu cầu được duyệt</p>
                    <p className="text-xs text-muted-foreground">{formatDate(data.approvedAt.toString())}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );

  const renderScheduleChangeContent = (data: ScheduleChangeResponse) => (
    <>
      {/* Header */}
      <DialogHeader className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg dark:bg-indigo-900/20">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">
                Chi tiết đơn dời lịch
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                ID: {data.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={requestTypeColors.reschedule}
            >
              {requestTypeLabels.reschedule}
            </Badge>
            <Badge
              variant="secondary"
              className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusLabels[data.status as keyof typeof statusLabels] || data.status}
            </Badge>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6">
          {/* Schedule Change Information */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Thông tin dời lịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lớp học</p>
                    <p className="text-sm text-muted-foreground">{data.class.name}</p>
                    <p className="text-xs text-muted-foreground">{data.class.subject.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày cũ</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.originalDate)}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ngày mới</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.newDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Thời gian</p>
                    <p className="text-sm text-muted-foreground">{data.originalTime} → {data.newTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Chi tiết yêu cầu dời lịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Loại yêu cầu</p>
                <Badge
                  variant="secondary"
                  className={requestTypeColors.reschedule}
                >
                  {requestTypeLabels.reschedule}
                </Badge>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Trạng thái</p>
                <Badge
                  variant="secondary"
                  className={statusColors[data.status as keyof typeof statusColors] || statusColors.pending}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusLabels[data.status as keyof typeof statusLabels] || data.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              Lý do dời lịch
            </h3>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm leading-relaxed">{data.reason}</p>
            </div>
          </div>

          {/* Room Information */}
          {data.newRoom && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-600" />
                  Phòng học mới
                </h3>
                <div className="p-4 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <p className="text-sm font-medium">{data.newRoom.name}</p>
                </div>
              </div>
            </>
          )}

          {/* Teacher Information */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Thông tin giáo viên
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium mb-1">Giáo viên</p>
                <p className="text-sm text-muted-foreground">{data.teacher?.user?.fullName || 'N/A'}</p>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm font-medium mb-1">Người tạo yêu cầu</p>
                <p className="text-sm text-muted-foreground">{data.createdByUser?.fullName || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Lịch sử yêu cầu dời lịch
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Yêu cầu được tạo</p>
                  <p className="text-xs text-muted-foreground">{formatDate(data.createdAt.toString())}</p>
                </div>
              </div>
              {data.approvedAt && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Yêu cầu được duyệt</p>
                    <p className="text-xs text-muted-foreground">{formatDate(data.approvedAt.toString())}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {renderContent()}
          
          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            {currentData.status === 'pending' && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsLoading(true);
                  // Handle cancel request
                  setTimeout(() => {
                    setIsLoading(false);
                    onClose();
                  }, 1000);
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Hủy đơn'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
