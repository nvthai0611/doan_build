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
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface LeaveRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  sessionRequest?: SessionRequestResponse | null;
  scheduleChange?: ScheduleChangeResponse | null;
  requestType?: string;
}

export default function LeaveRequestDetailModal({
  isOpen,
  onClose,
  leaveRequest,
  sessionRequest,
  scheduleChange,
  requestType = 'leave',
}: LeaveRequestDetailModalProps) {
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
          {/* Basic Information */}
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
                  <p className="text-sm font-medium">Ngày tạo</p>
                  <p className="text-sm text-muted-foreground">{formatDate(data.createdAt)}</p>
                </div>
              </div>
              {data.approvedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Ngày duyệt</p>
                    <p className="text-sm text-muted-foreground">{formatDate(data.approvedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Lý do xin nghỉ</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{data.reason}</p>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Ghi chú</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{data.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Affected Sessions */}
          {data.affectedSessions && data.affectedSessions.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Sessions bị ảnh hưởng</h3>
                <div className="space-y-2">
                  {data.affectedSessions.map((session, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{session.session?.class?.subject?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(session.session?.sessionDate)} - {session.session?.startTime} → {session.session?.endTime}
                          </p>
                        </div>
                        {session.replacementTeacher && (
                          <Badge variant="outline">
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
          {/* Basic Information */}
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
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Ngày tạo</p>
                  <p className="text-sm text-muted-foreground">{formatDate(data.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Lý do yêu cầu</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{data.reason}</p>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Ghi chú</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">{data.notes}</p>
                </div>
              </div>
            </>
          )}

          {/* Room Information */}
          {data.room && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Thông tin phòng học</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{data.room.name}</p>
                </div>
              </div>
            </>
          )}
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
          {/* Basic Information */}
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

          <Separator />

          {/* Reason */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Lý do dời lịch</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{data.reason}</p>
            </div>
          </div>

          {/* Room Information */}
          {data.newRoom && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Phòng học mới</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">{data.newRoom.name}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {renderContent()}

          <ScrollArea className="flex-1 px-6 py-2">
            <div className="space-y-6">
              {/* Status and Type */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  <Badge
                    variant="secondary"
                    className={statusColors[leaveRequest.status as keyof typeof statusColors]}
                  >
                    {statusLabels[leaveRequest.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <Badge
                  variant="secondary"
                  className={requestTypeColors[leaveRequest.requestType as keyof typeof requestTypeColors]}
                >
                  {requestTypeLabels[leaveRequest.requestType as keyof typeof requestTypeLabels]}
                </Badge>
              </div>

               {/* Main Content Grid */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                 {/* Left Column - Main Info */}
                 <div className="xl:col-span-2 space-y-6">

                   {/* Request Details */}
                   <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                     <h3 className="font-semibold text-lg flex items-center gap-2">
                       <FileText className="h-5 w-5" />
                       Thông tin đơn
                     </h3>
                     <div className="space-y-4">
                       <div className="space-y-2">
                         <label className="text-sm font-medium text-muted-foreground">
                           Lý do nghỉ
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
                       {leaveRequest.imageUrl && (
                         <div className="space-y-2">
                           <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                             <ImageIcon className="h-4 w-4" />
                             Hình ảnh đính kèm
                           </label>
                           <div className="bg-background rounded-md p-3 border">
                             <img
                               src={leaveRequest.imageUrl}
                               alt="Hình ảnh đính kèm"
                               className="w-full h-auto max-h-[250px] rounded-md object-contain"
                               onError={(e) => {
                                 const target = e.target as HTMLImageElement;
                                 target.style.display = 'none';
                                 const parent = target.parentElement;
                                 if (parent) {
                                   parent.innerHTML = '<p class="text-sm text-muted-foreground">Không thể tải hình ảnh</p>';
                                 }
                               }}
                             />
                           </div>
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
                                  {session.session.class.name || 'Lớp học'} - Thay thế bởi {session.replacementTeacher?.user.fullName || 'Giáo viên'}
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
                          Cuộn để xem thêm {leaveRequest.affectedSessions.length - 5} sessions
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
                        <span className="font-medium">{formatDate(leaveRequest.createdAt)}</span>
                      </div>
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-muted-foreground">Cập nhật cuối:</span>
                         <span className="font-medium">{formatDate(leaveRequest.createdAt)}</span>
                       </div>
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

                  {/* Teacher Info */}
                  <div className="bg-muted/30 rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Thông tin giáo viên
                    </h3>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={leaveRequest.teacherId} />
                        <AvatarFallback>
                          {leaveRequest.teacherId.charAt(0) || 'T'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {leaveRequest.createdByUser?.fullName || 'Giáo viên'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leaveRequest.createdByUser?.email || 'email@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </ScrollArea>

           {/* Footer */}
           <div className="px-6 py-4 border-t bg-muted/20">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
               <div className="text-sm text-muted-foreground">
                 Đơn được tạo lúc {formatDate(leaveRequest.createdAt)}
               </div>
               <div className="flex items-center gap-2">
                 <Button variant="outline" onClick={onClose}>
                   Đóng
                 </Button>
                 {/* {leaveRequest.status === 'pending' && (
                   <Button variant="destructive">
                     Hủy đơn
                   </Button>
                 )} */}
               </div>
             </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
