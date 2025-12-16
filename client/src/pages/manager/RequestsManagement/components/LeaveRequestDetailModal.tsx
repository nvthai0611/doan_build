import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  BookOpen,
  Users
} from 'lucide-react'
import { SelectSubstituteTeacherSheet } from './SelectSubstituteTeacherSheet'

interface LeaveRequest {
  id: string
  type: string
  teacherId: string
  startDate: string
  endDate: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  imageUrl?: string
  createdAt: string
  approvedAt?: string
  teacherInfo: {
    fullName: string
    email: string
  }
  approvedByUser?: {
    fullName: string
    email: string
  }
  affectedSessions?: Array<{
    id: string
    class: string
    subject: string
    sessionDate: string
    startTime: string
    endTime: string
    session: {
      sessionDate: string
      startTime: string
      endTime: string
    }
  }>
}

interface LeaveRequestDetailModalProps {
  [key: string]: any
}

const requestTypeLabels = {
  sick_leave: 'Nghỉ ốm',
  personal_leave: 'Nghỉ phép',
  emergency_leave: 'Nghỉ khẩn cấp',
  other: 'Khác',
}

const requestTypeColors = {
  sick_leave: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  personal_leave: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  emergency_leave: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
}

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
}

const LeaveRequestDetailModal: React.FC<any> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  sessionReplacements = {},
  setSessionReplacements,
}) => {
  if (!request) return null

  const [selectTeacherOpen, setSelectTeacherOpen] = useState(false)
  const [currentSession, setCurrentSession] = useState<any | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'approved':
        return <CheckCircle className="w-4 h-4" />
      case 'rejected':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chi tiết đơn xin nghỉ phép
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {(request.teacherInfo?.fullName || 'U').split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{request.teacherInfo?.fullName || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground">{request.teacherInfo?.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={requestTypeColors[request?.type as keyof typeof requestTypeColors] || requestTypeColors.other}
              >
                {requestTypeLabels[request?.type as keyof typeof requestTypeLabels] || request?.type}
              </Badge>
              <Badge
                variant="secondary"
                className={statusColors[request?.status as keyof typeof statusColors] || statusColors.pending}
              >
                {/* {getStatusIcon(request.status)} */}
                {statusLabels[request?.status as keyof typeof statusLabels] || request?.status}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Thông tin nghỉ phép
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</label>
                  <p className="text-sm">{formatDate(request?.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày kết thúc</label>
                  <p className="text-sm">{formatDate(request?.endDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Số ngày nghỉ</label>
                  <p className="text-sm">
                    {Math.ceil((new Date(request?.endDate).getTime() - new Date(request?.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} ngày
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Thông tin xử lý
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ngày tạo</label>
                  <p className="text-sm">{formatDateTime(request?.createdAt)}</p>
                </div>
                {request.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ngày xử lý</label>
                    <p className="text-sm">{formatDateTime(request?.approvedAt)}</p>
                  </div>
                )}
                {request.approvedByUser && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Người xử lý</label>
                    <p className="text-sm">{request?.approvedByUser?.fullName}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lý do nghỉ phép
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{request?.reason}</p>
              {request.notes && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-muted-foreground">Ghi chú</label>
                  <p className="text-sm whitespace-pre-wrap">{request?.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Affected Sessions */}
          {request?.affectedSessions && request?.affectedSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Buổi học bị ảnh hưởng ({request?.affectedSessions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-orange-600 mb-3">
                  Khi duyệt đơn, các buổi KHÔNG có giáo viên thay thế sẽ bị hủy. Bạn có thể gán giáo viên dạy thay cho từng buổi cần giữ lịch.
                </p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {request?.affectedSessions.map((session: any) => {
                    const key = session.sessionId || session.id
                    const hasReplacement = !!sessionReplacements[key]
                    return (
                      <div
                        key={session?.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg gap-3"
                      >
                        <div>
                          <p className="font-medium">
                            {session?.class?.name || session?.class || '-'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session?.subject?.name || session?.subject || ''}
                          </p>
                          <p className="font-medium">
                            {session?.session?.sessionDate
                              ? formatDate(session.session.sessionDate)
                              : formatDate(session?.sessionDate)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm">
                              {formatDate(session?.sessionDate)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session?.startTime} - {session?.endTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={hasReplacement ? 'default' : 'outline'}
                              className={
                                hasReplacement
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {hasReplacement
                                ? 'Đã gán giáo viên thay thế'
                                : 'Chưa gán giáo viên thay thế'}
                            </Badge>
                            {request.status === 'pending' && setSessionReplacements && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentSession(session)
                                    setSelectTeacherOpen(true)
                                  }}
                                >
                                  Chọn giáo viên
                                </Button>
                                {hasReplacement && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-red-600"
                                    onClick={() => {
                                      const keyToClear = session.sessionId || session.id
                                      if (!keyToClear) return
                                      const next = { ...sessionReplacements }
                                      delete next[keyToClear]
                                      setSessionReplacements(next)
                                    }}
                                  >
                                    Bỏ gán
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Image Attachment
          {request.imageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Tài liệu đính kèm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={request.imageUrl} 
                  alt="Tài liệu đính kèm" 
                  className="max-w-full h-auto rounded-lg border"
                />
              </CardContent>
            </Card>
          )} */}

          {/* Actions */}
          {request.status === 'pending' && (onApprove || onReject) && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              {onReject && (
                <Button 
                  variant="destructive" 
                  onClick={() => onReject(request.id)}
                  className="flex items-center gap-2"
                >
                  Từ chối
                </Button>
              )}
              {onApprove && (
                <Button 
                  onClick={() => onApprove(request.id)}
                  className="flex items-center gap-2"
                >
                  Duyệt đơn
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Sheet chọn giáo viên thay thế cho từng buổi */}
        {currentSession && setSessionReplacements && (
          <SelectSubstituteTeacherSheet
            open={selectTeacherOpen}
            onOpenChange={(open: boolean) => {
              setSelectTeacherOpen(open)
              if (!open) {
                setCurrentSession(null)
              }
            }}
            className={currentSession?.class?.name || currentSession?.class}
            subjectName={currentSession?.subject?.name || currentSession?.subject}
            excludeTeacherId={request.teacherId}
            onSubmit={(teacherId: string) => {
              const key = currentSession.sessionId || currentSession.id
              if (!key) return
              setSessionReplacements({
                ...sessionReplacements,
                [key]: teacherId,
              })
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default LeaveRequestDetailModal
